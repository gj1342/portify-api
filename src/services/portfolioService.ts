import { Portfolio } from '../models/Portfolio';
import { User } from '../models/User';
import { PortfolioData } from '../types/portfolio.types';
import { AppError } from '../utils/errorHandler';
import { ERROR_MESSAGES } from '../constants/httpStatus';

export class PortfolioService {
  static async getUserProfile(userId: string) {
    const user = await User.findById(userId).populate('portfolios');
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        portfolioCount: user.portfolioCount,
      },
      portfolios: user.portfolios,
    };
  }

  static async createPortfolio(userId: string, portfolioData: PortfolioData) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    if (user.portfolioCount >= 2) {
      throw new AppError('Users can only create up to 2 portfolios', 400);
    }

    const portfolio = await Portfolio.create({
      ...portfolioData,
      userId: user._id,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { portfolios: portfolio._id },
      $inc: { portfolioCount: 1 }
    });

    return portfolio;
  }

  static async updatePortfolio(userId: string, portfolioId: string, portfolioData: PortfolioData) {
    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: portfolioId, userId: userId },
      portfolioData,
      { new: true }
    );

    if (!portfolio) {
      throw new AppError('Portfolio not found or access denied', 404);
    }

    return portfolio;
  }

  static async getPortfolio(userId: string, portfolioId: string) {
    const portfolio = await Portfolio.findOne({
      _id: portfolioId,
      userId: userId
    });

    if (!portfolio) {
      throw new AppError('Portfolio not found or access denied', 404);
    }

    return portfolio;
  }

  static async deletePortfolio(userId: string, portfolioId: string) {
    const portfolio = await Portfolio.findOneAndDelete({
      _id: portfolioId,
      userId: userId
    });

    if (!portfolio) {
      throw new AppError('Portfolio not found or access denied', 404);
    }

    await User.findByIdAndUpdate(userId, {
      $pull: { portfolios: portfolio._id },
      $inc: { portfolioCount: -1 }
    });

    return { message: 'Portfolio deleted successfully', deletedPortfolio: portfolio };
  }
}
