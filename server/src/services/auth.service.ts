import jwt, { SignOptions } from "jsonwebtoken";
import crypto from "crypto";
import { UserModel, IUser } from "../models/user.model";
import { RefreshTokenModel } from "../models/refresh-token.model";
import {
  RoleApplicationModel,
  IRoleApplication,
} from "../models/role-application.model";
import { UserRole, UserStatus, RBAC_VERSION } from "../config/rbac/types";
import {
  validateRoleConstraints,
  validateRoleTransition,
} from "../config/rbac/validators";
import { AppError } from "../utils/error.util";
import { emailService } from "../utils/email.util";

export class AuthService {
  private static generateAccessToken(userId: string, roles: string[]): string {
    const signOptions: SignOptions = {
      expiresIn: "1h", // 1 hour
    };

    return jwt.sign(
      { 
        id: userId,
        roles: roles 
      },
      process.env.JWT_SECRET || "default-secret",
      signOptions
    );
  }

  private static async generateRefreshToken(
    userId: string,
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<string> {
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
      profile: {
        firstName: string;
        lastName: string;
        phone?: string;
      };
      interests?: string[];
      contentPreferences?: {
        languages?: string[];
        types?: string[];
      };
    },
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
    rbacVersion: string;
  }> {
    const existingUser = await UserModel.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    const user = await UserModel.create({
      email: userData.email,
      password: userData.password,
      profile: {
        firstName: userData.profile.firstName,
        lastName: userData.profile.lastName,
        phone: userData.profile.phone,
      },
      roles: [UserRole.USER],
      status:
        process.env.NODE_ENV === "development"
          ? UserStatus.ACTIVE
          : UserStatus.PENDING_VERIFICATION,
      roleSpecificData: {
        user: {
          lastActiveAt: new Date(),
          interests: userData.interests || [],
          preferences: {
            contentLanguages: userData.contentPreferences?.languages || [],
            contentTypes: userData.contentPreferences?.types || [],
            notificationFrequency: "immediate",
          },
        },
      },
    });

    const accessToken = this.generateAccessToken(user._id.toString(), user.roles);
    const refreshToken = await this.generateRefreshToken(
      user._id.toString(),
      deviceInfo
    );

    // Skip email verification in development
    if (process.env.NODE_ENV !== "development") {
      await this.sendVerificationEmail(user.email, accessToken);
    }

    return {
      user,
      accessToken,
      refreshToken,
      rbacVersion: RBAC_VERSION.toString(),
    };
  }

  static async login(
    email: string,
    password: string,
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<{
    user: {
      id: string;
      email: string;
      roles: string[];
      status: string;
    };
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

    const accessToken = this.generateAccessToken(user._id.toString(), user.roles);
    const refreshToken = await this.generateRefreshToken(
      user._id.toString(),
      deviceInfo
    );

    // Return minimal user data
    return {
      user: {
        id: user._id.toString(),
        email: user.email,
        roles: user.roles,
        status: user.status
      },
      accessToken,
      refreshToken
    };
  }

  static async refreshToken(
    oldRefreshToken: string,
    deviceInfo: { ip: string; userAgent: string; deviceId?: string }
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    rbacVersion: string;
  }> {
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
    const accessToken = this.generateAccessToken(
      existingToken.user._id.toString(),
      existingToken.user.roles
    );
    const refreshToken = await this.generateRefreshToken(
      existingToken.user._id.toString(),
      deviceInfo
    );

    return {
      accessToken,
      refreshToken,
      rbacVersion: RBAC_VERSION.toString(),
    };
  }

  static async logout(userId: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      // Revoke specific refresh token
      await RefreshTokenModel.updateOne(
        { user: userId, token: refreshToken, isRevoked: false },
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
    await RefreshTokenModel.updateMany({ user: userId }, { isRevoked: true });
  }

  static async forgotPassword(email: string): Promise<void> {
    const user = await UserModel.findOne({ email });

    // Don't expose user existence (security measure)
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Check if user is locked out from password reset attempts
    const MAX_RESET_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 60 * 60 * 1000; // 1 hour

    if (
      user.security?.passwordResetAttempts >= MAX_RESET_ATTEMPTS &&
      user.security?.lockUntil &&
      user.security.lockUntil > new Date()
    ) {
      throw new AppError(
        "Too many reset attempts. Please try again after an hour.",
        429
      );
    }

    // Generate and hash reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Update security fields
    user.security = {
      ...user.security,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      passwordResetAttempts: (user.security?.passwordResetAttempts || 0) + 1,
    };

    // If max attempts reached, set lockout
    if (user.security.passwordResetAttempts >= MAX_RESET_ATTEMPTS) {
      user.security.lockUntil = new Date(Date.now() + LOCKOUT_DURATION);
    }

    await user.save({ validateBeforeSave: false });

    try {
      // Verify email service connection first
      await emailService.verifyConnection();

      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await emailService.sendPasswordResetEmail(
        user.email,
        user.profile?.firstName || user.email.split("@")[0],
        resetUrl
      );
    } catch (error) {
      console.error("Failed to send password reset email:", error);
      // Revert security changes on email failure
      user.security = {
        ...user.security,
        resetPasswordToken: undefined,
        resetPasswordExpires: undefined,
        passwordResetAttempts: Math.max(
          0,
          (user.security?.passwordResetAttempts || 1) - 1
        ),
      };
      await user.save({ validateBeforeSave: false });
      throw new AppError(
        "Failed to send password reset email. Please try again later.",
        500
      );
    }
  }

  static async resetPassword(
    token: string,
    newPassword: string,
    revokeAllSessions: boolean = false
  ): Promise<void> {
    // Hash the token for comparison
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      "security.resetPasswordToken": hashedToken,
      "security.resetPasswordExpires": { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      throw new AppError("Invalid or expired password reset token", 400);
    }

    // Prevent reuse of old passwords
    if (await user.comparePassword(newPassword)) {
      throw new AppError(
        "New password must be different from the current one",
        400
      );
    }

    // Update password and reset security fields
    user.password = newPassword;
    user.security = {
      ...user.security,
      passwordChangedAt: new Date(),
      resetPasswordToken: undefined,
      resetPasswordExpires: undefined,
      passwordResetAttempts: 0,
      lockUntil: undefined,
    };

    await user.save();

    // Only revoke all sessions if explicitly requested
    if (revokeAllSessions) {
      await this.revokeAllUserSessions(user._id.toString());
    }

    // Send notification email only for non-reset password changes
    if (!token) {
      try {
        await emailService.sendPasswordChangeNotification(
          user.email,
          user.profile?.firstName || user.email.split("@")[0]
        );
      } catch (error) {
        console.error("Failed to send password change notification:", error);
      }
    }
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
    // Get user's current roles
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Validate role transition
    if (!user.roles.includes(UserRole.USER)) {
      throw new AppError("Base USER role is required", 400);
    }

    if (!validateRoleTransition(UserRole.USER, roleData.requestedRole)) {
      throw new AppError(
        `Cannot apply for ${roleData.requestedRole} role from current roles`,
        400
      );
    }

    // Check if the resulting role combination would be valid
    const potentialRoles = [...user.roles, roleData.requestedRole];
    if (!validateRoleConstraints(potentialRoles)) {
      throw new AppError("The requested role combination is not allowed", 400);
    }

    // Check for existing applications
    const existingApplication = await RoleApplicationModel.findOne({
      userId,
      requestedRole: roleData.requestedRole,
      status: { $in: ["PENDING", "IN_REVIEW"] },
    });

    if (existingApplication) {
      throw new AppError("You already have a pending application", 400);
    }

    // Create role application with required role-specific data validation
    const application = await RoleApplicationModel.create({
      userId,
      currentRoles: user.roles,
      ...roleData,
      submittedAt: new Date(),
    });

    // Send notification to admins about new role application
    try {
      await emailService.sendAdminNotification(
        "New Role Application",
        `User ${user.email} has applied for ${roleData.requestedRole} role.`
      );
    } catch (error) {
      console.error("Failed to send admin notification:", error);
    }

    return application;
  }
}
