// server/controllers/roleApplication.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../utils/catch-async.util";
import { RoleApplicationService } from "../services/role-application.service";

export class RoleApplicationController {
  private roleApplicationService = new RoleApplicationService();

  createApplication = catchAsync(async (req: Request, res: Response) => {
    const application = await this.roleApplicationService.createApplication({
      ...req.body,
      user: req.user!.id
    });
    res.status(201).json({
      status: "success",
      data: application
    });
  });

  getMyApplications = catchAsync(async (req: Request, res: Response) => {
    const applications = await this.roleApplicationService.getMyApplications(req.user!.id);
    res.status(200).json({
      status: "success",
      data: applications
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
    const application = await this.roleApplicationService.getApplication(req.params.id);
    res.status(200).json({
      status: "success",
      data: application
    });
  });

  approveApplication = catchAsync(async (req: Request, res: Response) => {
    const application = await this.roleApplicationService.approveApplication(
      req.params.id,
      req.user!.id
    );
    res.status(200).json({
      status: "success",
      data: application
    });
  });

  rejectApplication = catchAsync(async (req: Request, res: Response) => {
    const application = await this.roleApplicationService.rejectApplication(
      req.params.id,
      req.user!.id,
      req.body.reason
    );
    res.status(200).json({
      status: "success",
      data: application
    });
  });
}

export default new RoleApplicationController();
