import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.util";
import { AuthService } from "../services/auth.service";

export class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const { user, token } = await AuthService.register(req.body);
    res.status(201).json({
      status: "success",
      data: { user, token },
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const { user, token } = await AuthService.login(email, password);
    res.status(200).json({
      status: "success",
      data: { user, token },
    });
  });

  forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.forgotPassword(req.body.email);
    res.status(200).json({
      status: "success",
      message: "Password reset email sent",
    });
  });

  resetPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthService.resetPassword(req.params.token, req.body.password);
    res.status(200).json({
      status: "success",
      message: "Password reset successful",
    });
  });

  getMe = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      data: req.user,
    });
  });

  logout = catchAsync(async (_req: Request, res: Response) => {
    // In a token-based system, client should discard token
    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  });

  refreshToken = catchAsync(async (req: Request, res: Response) => {
    const token = await AuthService.refreshToken(req.user?.id);
    res.status(200).json({
      status: "success",
      data: { token },
    });
  });
}
