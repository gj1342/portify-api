import { Portfolio } from '../models/Portfolio';
import { User } from '../models/User';
import { PortfolioData } from '../types/portfolio.types';
import { AppError } from '../utils/errorHandler';
import { ERROR_MESSAGES } from '../constants/httpStatus';

export class PortfolioService {
  static async getUserProfile(userId: string) {
    const user = await User.findById(userId).populate('portfolio');
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
      portfolio: user.portfolio,
    };
  }

  static async updateUserPortfolio(userId: string, portfolioData: PortfolioData) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    let portfolio = await Portfolio.findById(user.portfolio);
    
    if (!portfolio) {
      portfolio = await Portfolio.create(portfolioData);
      await User.findByIdAndUpdate(userId, { portfolio: portfolio._id });
    } else {
      portfolio = await Portfolio.findByIdAndUpdate(
        user.portfolio,
        portfolioData,
        { new: true }
      );
    }

    return portfolio;
  }
}
