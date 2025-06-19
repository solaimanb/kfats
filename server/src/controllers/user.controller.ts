import { Request, Response } from 'express';
import { catchAsync } from '../utils/catch-async.util';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.getProfile(req.user?.id);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.updateProfile(req.user?.id, req.body);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  });

  updatePassword = catchAsync(async (req: Request, res: Response) => {
    await this.userService.updatePassword(req.user?.id, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  });

  getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await this.userService.getAllUsers(req.query);
    res.status(200).json({
      status: 'success',
      data: users,
    });
  });

  getUser = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.getUser(req.params.id);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  });

  createUser = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json({
      status: 'success',
      data: user,
    });
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const user = await this.userService.updateUser(req.params.id, req.body);
    res.status(200).json({
      status: 'success',
      data: user,
    });
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    await this.userService.deleteUser(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
} 