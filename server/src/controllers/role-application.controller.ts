import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.util";
import {
  RoleApplicationService,
  CreateApplicationData,
} from "../services/role-application.service";
import { CreateRoleApplicationInput } from "../validators/role-application.validator";
import { AppError } from "../utils/error.util";

export class RoleApplicationController {
  private roleApplicationService = new RoleApplicationService();

  createApplication = catchAsync(async (req: Request, res: Response) => {
    const applicationData = req.body as CreateRoleApplicationInput;

    const data: CreateApplicationData = {
      ...applicationData,
      user: req.user!.id,
    };

    const application = await this.roleApplicationService.createApplication(
      data,
      req
    );

    return res.status(201).json({
      status: "success",
      data: application,
    });
  });

  getMyApplications = catchAsync(async (req: Request, res: Response) => {
    const applications = await this.roleApplicationService.getMyApplications(
      req.user!.id
    );
    res.status(200).json({
      status: "success",
      data: applications,
    });
  });

  getAllApplications = catchAsync(async (_req: Request, res: Response) => {
    const applications = await this.roleApplicationService.getAllApplications();
    res.status(200).json({
      status: "success",
      data: applications,
    });
  });

  getApplication = catchAsync(async (req: Request, res: Response) => {
    const application = await this.roleApplicationService.getApplication(
      req.params.id
    );
    res.status(200).json({
      status: "success",
      data: application,
    });
  });

  approveApplication = catchAsync(async (req: Request, res: Response) => {
    const application = await this.roleApplicationService.approveApplication(
      req.params.id,
      req.user!.id
    );
    res.status(200).json({
      status: "success",
      data: application,
    });
  });

  rejectApplication = catchAsync(async (req: Request, res: Response) => {
    if (!req.body.reason) {
      throw new AppError("Rejection reason is required", 400);
    }

    const application = await this.roleApplicationService.rejectApplication(
      req.params.id,
      req.user!.id,
      req.body.reason
    );

    return res.status(200).json({
      status: "success",
      data: application,
    });
  });

  updateVerificationStep = catchAsync(async (req: Request, res: Response) => {
    const { id, stepName } = req.params;
    const { status, notes } = req.body;

    if (!["completed", "failed"].includes(status)) {
      throw new AppError("Status must be either 'completed' or 'failed'", 400);
    }

    const application = await RoleApplicationService.updateVerificationStep(
      id,
      req.user!.id,
      stepName,
      status,
      notes
    );

    return res.status(200).json({
      status: "success",
      data: application,
    });
  });

  getApplicationStats = catchAsync(async (_req: Request, res: Response) => {
    const stats = await RoleApplicationService.getApplicationStats();
    return res.status(200).json({
      status: "success",
      data: stats,
    });
  });
}

export default new RoleApplicationController();
