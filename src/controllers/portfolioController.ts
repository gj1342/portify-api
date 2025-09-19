import { Request, Response } from 'express';
import { PortfolioService } from '../services/portfolioService';
import { ResponseHelper } from '../utils/responseHelper';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/httpStatus';
import { asyncHandler, AppError } from '../utils/errorHandler';
import { UserDocument } from '../types/user.types';

export class PortfolioController {
  static getUserProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }
    
    const userProfile = await PortfolioService.getUserProfile(user._id.toString());
    return ResponseHelper.success(res, userProfile, SUCCESS_MESSAGES.PROFILE_RETRIEVED);
  });

  static createPortfolio = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const { portfolioData } = req.body;
    
    if (!portfolioData) {
      throw new AppError(ERROR_MESSAGES.MISSING_DATA, 400);
    }

    const portfolio = await PortfolioService.createPortfolio(user._id.toString(), portfolioData);
    return ResponseHelper.success(res, portfolio, SUCCESS_MESSAGES.PORTFOLIO_CREATED);
  });

  static updatePortfolio = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const { portfolioId } = req.params;
    const { portfolioData } = req.body;
    
    if (!portfolioData) {
      throw new AppError(ERROR_MESSAGES.MISSING_DATA, 400);
    }

    const portfolio = await PortfolioService.updatePortfolio(user._id.toString(), portfolioId, portfolioData);
    return ResponseHelper.success(res, portfolio, SUCCESS_MESSAGES.PORTFOLIO_UPDATED);
  });

  static getPortfolio = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as UserDocument;
    if (!user) {
      throw new AppError(ERROR_MESSAGES.UNAUTHORIZED, 401);
    }

    const { portfolioId } = req.params;
    const portfolio = await PortfolioService.getPortfolio(user._id.toString(), portfolioId);
    return ResponseHelper.success(res, portfolio, SUCCESS_MESSAGES.PORTFOLIO_RETRIEVED);
  });
}
