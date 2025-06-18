import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.util";

export class OAuthController {
  googleAuthCallback = catchAsync(async (_req: Request, res: Response) => {
    res.redirect(process.env.CLIENT_URL || "/");
  });

  getOAuthTokens = catchAsync(async (req: Request, res: Response) => {
    res.status(200).json({
      status: "success",
      data: req.user,
    });
  });
}
