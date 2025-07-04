import { Request, Response, NextFunction } from 'express';
import { BaseService } from '../services/base.service';
import { Document } from 'mongoose';

export abstract class BaseController<T extends Document> {
  constructor(protected service: BaseService<T>) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.create(req.body);
      res.status(201).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.findWithPagination(req.query);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.findById(req.params.id);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.service.update(req.params.id, req.body);
      res.status(200).json({
        status: 'success',
        data,
      });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.service.delete(req.params.id);
      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = BaseController;
