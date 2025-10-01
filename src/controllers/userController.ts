import { Request, Response } from 'express';
import { User } from '../models/User';
import { UserDocument } from '../types/user.types';
import { UserPortfolioData } from '../types/user.types';
import { ResponseHelper } from '../utils/responseHelper';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/httpStatus';
import { asyncHandler, AppError } from '../utils/errorHandler';
import { UserService } from '../services/userService';

export class UserController {
  public static updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    const { profileData, onboardingCompleted } = req.body;

    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const updateData: any = {};
    if (profileData) {
      updateData.profileData = profileData;
    }
    if (onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = onboardingCompleted;
    }

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    return ResponseHelper.success(res, {
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
      profileData: updatedUser.profileData,
    }, SUCCESS_MESSAGES.PROFILE_UPDATED);
  });

  public static getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;

    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const userProfile = await User.findById(user._id).select('-googleId -portfolios');

    if (!userProfile) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    return ResponseHelper.success(res, {
      user: {
        _id: userProfile._id,
        name: userProfile.name,
        email: userProfile.email,
        avatar: userProfile.avatar,
        username: userProfile.username,
        onboardingCompleted: userProfile.onboardingCompleted,
      },
      profileData: userProfile.profileData,
    }, SUCCESS_MESSAGES.PROFILE_RETRIEVED);
  });

  public static checkOnboardingStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;

    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const userProfile = await User.findById(user._id).select('onboardingCompleted');

    if (!userProfile) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    return ResponseHelper.success(res, {
      onboardingCompleted: userProfile.onboardingCompleted,
    }, SUCCESS_MESSAGES.OPERATION_SUCCESS);
  });

  public static uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;

    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    if (!req.file) {
      throw new AppError('No file provided', 400);
    }

    const { buffer, originalname, mimetype } = req.file;
    const result = await UserService.uploadAvatar(user._id.toString(), buffer, originalname, mimetype);

    return ResponseHelper.success(res, result, 'Avatar uploaded and profile updated successfully');
  });

  public static updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const currentUser = req.user as UserDocument;
    const { name, email, avatar, profileData, onboardingCompleted } = req.body;

    if (!currentUser) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    // Users can only update their own profile, unless they're admin
    if (currentUser._id.toString() !== id && currentUser.role !== 'admin') {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 403);
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (profileData !== undefined) updateData.profileData = profileData;
    if (onboardingCompleted !== undefined) updateData.onboardingCompleted = onboardingCompleted;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    return ResponseHelper.success(res, {
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        role: updatedUser.role,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
      profileData: updatedUser.profileData,
    }, SUCCESS_MESSAGES.PROFILE_UPDATED);
  });
}

