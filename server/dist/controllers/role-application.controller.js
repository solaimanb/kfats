"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleApplicationController = void 0;
const catch_async_util_1 = require("../utils/catch-async.util");
const role_application_service_1 = require("../services/role-application.service");
class RoleApplicationController {
    constructor() {
        this.roleApplicationService = new role_application_service_1.RoleApplicationService();
        this.createApplication = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const application = await this.roleApplicationService.createApplication(Object.assign(Object.assign({}, req.body), { user: req.user.id }));
            res.status(201).json({
                status: "success",
                data: application
            });
        });
        this.getMyApplications = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const applications = await this.roleApplicationService.getMyApplications(req.user.id);
            res.status(200).json({
                status: "success",
                data: applications
            });
        });
        this.getAllApplications = (0, catch_async_util_1.catchAsync)(async (_req, res) => {
            const applications = await this.roleApplicationService.getAllApplications();
            res.status(200).json({
                status: "success",
                data: applications,
            });
        });
        this.getApplication = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const application = await this.roleApplicationService.getApplication(req.params.id);
            res.status(200).json({
                status: "success",
                data: application
            });
        });
        this.approveApplication = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const application = await this.roleApplicationService.approveApplication(req.params.id);
            res.status(200).json({
                status: "success",
                data: application
            });
        });
        this.rejectApplication = (0, catch_async_util_1.catchAsync)(async (req, res) => {
            const application = await this.roleApplicationService.rejectApplication(req.params.id);
            res.status(200).json({
                status: "success",
                data: application
            });
        });
    }
}
exports.RoleApplicationController = RoleApplicationController;
exports.default = new RoleApplicationController();
//# sourceMappingURL=role-application.controller.js.map