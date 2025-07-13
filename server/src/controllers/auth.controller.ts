import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async.util";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static register = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, password, profile } = req.body;

      const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
      };

      const { user, accessToken, refreshToken } = await AuthService.register(
        {
          email,
          password,
          profile,
        },
        deviceInfo
      );

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.status(201).json({
        status: "success",
        data: {
          user,
          accessToken,
        },
      });
    }
  );

  static login = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, password } = req.body;

      const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
      };

      const { user, accessToken, refreshToken } = await AuthService.login(
        email,
        password,
        deviceInfo
      );

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Set access token in cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      // Set user cache in cookie
      res.cookie("auth_user_cache", JSON.stringify(user), {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.status(200).json({
        status: "success",
        data: {
          user,
          accessToken,
        },
      });
    }
  );

  static logout = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      // Clear both refresh token and access token cookies
      res.clearCookie("refreshToken", {
        path: '/',
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true
      });
      res.clearCookie("accessToken", {
        path: '/',
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        httpOnly: true
      });
      res.clearCookie("auth_user_cache", {
        path: '/',
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });

      res.status(200).json({
        status: "success",
        data: null,
      });
    }
  );

  static logoutAllDevices = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      await AuthService.revokeAllUserSessions(req.user!._id.toString());
      // Clear both refresh token and access token cookies
      res.clearCookie("refreshToken");
      res.clearCookie("accessToken", {
        path: '/',
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
      res.clearCookie("auth_user_cache", {
        path: '/',
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
      });
      res.status(200).json({
        status: "success",
        data: null,
      });
    }
  );

  static refreshToken = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const refreshToken = req.cookies.refreshToken;
      const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
      };

      const { accessToken, refreshToken: newRefreshToken } = await AuthService.refreshToken(
        refreshToken,
        deviceInfo
      );

      // Set new refresh token in HTTP-only cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      // Set new access token in cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.status(200).json({
        status: "success",
        data: {
          accessToken,
        },
      });
    }
  );

  static forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.forgotPassword(req.body.email);
    res.status(200).json({
      status: "success",
      message: "Password reset email sent",
    });
  });

  static resetPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.resetPassword(req.params.token, req.body.password);
    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  });

  static validateToken = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      // The user is already attached to the request by the protect middleware
      const user = req.user;

      // Set user cache in cookie
      res.cookie("auth_user_cache", JSON.stringify(user), {
        httpOnly: false, // Allow JavaScript access
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 1000, // 1 hour
      });

      res.status(200).json({
        status: "success",
        data: {
          user,
        },
      });
    }
  );
}
