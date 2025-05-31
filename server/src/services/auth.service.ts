import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { UserModel, IUser } from "../models/user.model";
import { RefreshTokenModel } from "../models/refresh-token.model";
import {
  RoleApplicationModel,
  IRoleApplication,
} from "../models/role-application.model";
import { UserRole, UserStatus } from "../config/rbac.config";
import { AppError } from "../utils/error.util";
import { emailService } from "../utils/email.util";

export class AuthService {
  private static generateAccessToken(userId: string): string {
    const signOptions: SignOptions = {
      expiresIn: "15m", // 15 minutes
    };

    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || "default-secret",
      signOptions
    );
  }

  private static async generateRefreshToken(
    userId: string,
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<string> {
    // Limit active refresh tokens per user (e.g., max 5 devices)
    const activeTokenCount = await RefreshTokenModel.countDocuments({
      user: userId,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    });

    if (activeTokenCount >= 5) {
      // Revoke oldest token if limit reached
      const oldestToken = await RefreshTokenModel.findOne({
        user: userId,
        isRevoked: false,
      }).sort({ issuedAt: 1 });
      
      if (oldestToken) {
        oldestToken.isRevoked = true;
        await oldestToken.save();
      }
    }

    const token = crypto.randomBytes(40).toString("hex");
    await RefreshTokenModel.create({
      user: userId,
      token,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      deviceInfo,
    });

    return token;
  }

  static async register(
    userData: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
    },
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const user = await UserModel.create({
      email: userData.email,
      password: userData.password,
      profile: {
        firstName: userData.firstName,
        lastName: userData.lastName,
      },
      roles: [UserRole.STUDENT],
      status:
        process.env.NODE_ENV === "development"
          ? UserStatus.ACTIVE
          : UserStatus.PENDING_VERIFICATION,
    });

    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = await this.generateRefreshToken(user._id.toString(), deviceInfo);

    // Skip email verification in development
    if (process.env.NODE_ENV !== "development") {
      await this.sendVerificationEmail(user.email, accessToken);
    }

    return { user, accessToken, refreshToken };
  }

  static async login(
    email: string,
    password: string,
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<{
    user: Partial<IUser>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError("Account not active", 403);
    }

    const accessToken = this.generateAccessToken(user._id.toString());
    const refreshToken = await this.generateRefreshToken(user._id.toString(), deviceInfo);

    // Remove sensitive data before sending response
    const sanitizedUser = user.toObject();
    const { password: pwd, security, ...userWithoutSensitiveData } = sanitizedUser;
    
    return { user: userWithoutSensitiveData, accessToken, refreshToken };
  }

  static async refreshToken(
    oldRefreshToken: string,
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // Find and validate the old refresh token
    const existingToken = await RefreshTokenModel.findOne({
      token: oldRefreshToken,
      isRevoked: false,
      expiresAt: { $gt: new Date() },
    }).populate<{ user: IUser }>("user");

    if (!existingToken) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    // Revoke the old refresh token (one-time use)
    existingToken.isRevoked = true;
    await existingToken.save();

    // Generate new tokens
    const accessToken = this.generateAccessToken(existingToken.user._id.toString());
    const refreshToken = await this.generateRefreshToken(
      existingToken.user._id.toString(),
      deviceInfo
    );

    return { accessToken, refreshToken };
  }

  static async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      await RefreshTokenModel.updateOne(
        { user: userId, token: refreshToken },
        { isRevoked: true }
      );
    } else {
      // Revoke all refresh tokens for user
      await RefreshTokenModel.updateMany(
        { user: userId, isRevoked: false },
        { isRevoked: true }
      );
    }
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    await RefreshTokenModel.updateMany(
      { user: userId },
      { isRevoked: true }
    );
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new AppError("No user found with that email address", 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.security = {
      ...user.security,
      resetPasswordToken: resetToken,
      resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };

    await user.save({ validateBeforeSave: false });

    // Send password reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      user.profile?.firstName || user.email.split("@")[0],
      `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`
    );
  }

  static async resetPassword(
    token: string,
    newPassword: string
  ): Promise<void> {
    const user = await UserModel.findOne({
      "security.resetPasswordToken": token,
      "security.resetPasswordExpires": { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError("Token is invalid or has expired", 400);
    }

    user.password = newPassword;
    user.security = {
      ...user.security,
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
    };
    await user.save();
  }

  private static async sendVerificationEmail(
    email: string,
    token: string
  ): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    await emailService.sendVerificationEmail(
      email,
      email.split("@")[0], // Using email username as name
      verificationUrl
    );
  }

  static async applyForRole(
    userId: string,
    roleData: {
      requestedRole: UserRole;
      applicationData: any;
      documents: Array<{ type: string; url: string; name: string }>;
    }
  ): Promise<IRoleApplication> {
    const existingApplication = await RoleApplicationModel.findOne({
      userId,
      requestedRole: roleData.requestedRole,
      status: { $in: ["PENDING", "IN_REVIEW"] },
    });

    if (existingApplication) {
      throw new AppError("You already have a pending application", 400);
    }

    return RoleApplicationModel.create({
      userId,
      ...roleData,
    });
  }
}
