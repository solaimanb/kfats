import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catch-async.util";
import { AuthService } from "../services/auth.service";

export class AuthController {
  static register = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { email, password, firstName, lastName } = req.body;

      const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
      };

      const { user, accessToken, refreshToken } = await AuthService.register(
        {
          email,
          password,
          firstName,
          lastName,
        },
        deviceInfo
      );

      // Set refresh token in HTTP-only cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
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
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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
      const refreshToken = req.cookies.refreshToken;

      // Clear refresh token from database
      await AuthService.logout(req.user!._id.toString(), refreshToken);

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      res.status(200).json({
        status: "success",
        data: null,
      });
    }
  );

  static logoutAllDevices = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      await AuthService.revokeAllUserSessions(req.user!._id.toString());

      // Clear refresh token cookie
      res.clearCookie("refreshToken");

      res.status(200).json({
        status: "success",
        message: "Logged out from all devices",
        data: null,
      });
    }
  );

  static refreshToken = catchAsync(
    async (req: Request, res: Response, _next: NextFunction) => {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        res.status(401).json({
          status: "fail",
          message: "No refresh token provided",
        });
        return;
      }

      const deviceInfo = {
        ip: req.ip || req.socket.remoteAddress || "unknown",
        userAgent: req.headers["user-agent"] || "",
        deviceId: req.body.deviceId,
      };

      const { accessToken, refreshToken: newRefreshToken } =
        await AuthService.refreshToken(refreshToken, deviceInfo);

      // Set new refresh token in HTTP-only cookie
      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
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

  static getMe = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      data: req.user,
    });
  });
}
