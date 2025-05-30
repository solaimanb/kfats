import { UserModel, IUser } from '../models/user.model';
import { AppError } from '../utils/error.util';
import { Document, FilterQuery } from 'mongoose';

export class UserService {
  async getProfile(userId: string): Promise<IUser & Document> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId: string, updateData: Partial<IUser>): Promise<IUser & Document> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updatePassword(userId: string, passwordData: { currentPassword: string; newPassword: string }): Promise<void> {
    const user = await UserModel.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!(await user.comparePassword(passwordData.currentPassword))) {
      throw new AppError('Current password is incorrect', 401);
    }

    user.password = passwordData.newPassword;
    await user.save();
  }

  async getAllUsers(query: FilterQuery<IUser>): Promise<(IUser & Document)[]> {
    return UserModel.find(query);
  }

  async getUser(userId: string): Promise<IUser & Document> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async createUser(userData: Partial<IUser>): Promise<IUser & Document> {
    return UserModel.create(userData);
  }

  async updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser & Document> {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async deleteUser(userId: string): Promise<void> {
    const user = await UserModel.findByIdAndDelete(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
  }
} 