import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { UserModel, IUser } from "../models/user.model";
import {
  RoleApplicationModel,
  IRoleApplication,
} from "../models/role-application.model";
import { UserRole, UserStatus } from "../config/rbac.config";
import { AppError } from "../utils/error.util";
import { emailService } from "../utils/email.util";

export class AuthService {
  private static generateToken(userId: string): string {
    const signOptions: SignOptions = {
      expiresIn: 3600, // 1 hour in seconds
    };

    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET || "default-secret",
      signOptions
    );
  }

  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: IUser; token: string }> {
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

    const token = this.generateToken(user._id.toString());

    // Skip email verification in development
    if (process.env.NODE_ENV !== "development") {
      await this.sendVerificationEmail(user.email, token);
    }

    return { user, token };
  }

  static async login(
    email: string,
    password: string
  ): Promise<{ user: Partial<IUser>; token: string }> {
    const user = await UserModel.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError("Invalid credentials", 401);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError("Account not active", 403);
    }

    const token = this.generateToken(user._id.toString());

    // Remove sensitive data before sending response
    const sanitizedUser = user.toObject();
    delete sanitizedUser.password;

    return { user: sanitizedUser, token };
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

  static async refreshToken(userId: string): Promise<string> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    return this.generateToken(user._id.toString());
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
