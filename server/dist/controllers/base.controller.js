"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
class BaseController {
    constructor(service) {
        this.create = async (req, res, next) => {
            try {
                const data = await this.service.create(req.body);
                res.status(201).json({
                    status: 'success',
                    data,
                });
            }
            catch (err) {
                next(err);
            }
        };
        this.getAll = async (req, res, next) => {
            try {
                const data = await this.service.findWithPagination(req.query);
                res.status(200).json({
                    status: 'success',
                    data,
                });
            }
            catch (err) {
                next(err);
            }
        };
        this.getById = async (req, res, next) => {
            try {
                const data = await this.service.findById(req.params.id);
                res.status(200).json({
                    status: 'success',
                    data,
                });
            }
            catch (err) {
                next(err);
            }
        };
        this.update = async (req, res, next) => {
            try {
                const data = await this.service.update(req.params.id, req.body);
                res.status(200).json({
                    status: 'success',
                    data,
                });
            }
            catch (err) {
                next(err);
            }
        };
        this.delete = async (req, res, next) => {
            try {
                await this.service.delete(req.params.id);
                res.status(204).json({
                    status: 'success',
                    data: null,
                });
            }
            catch (err) {
                next(err);
            }
        };
        this.service = service;
    }
}
exports.BaseController = BaseController;
module.exports = BaseController;
//# sourceMappingURL=base.controller.js.map