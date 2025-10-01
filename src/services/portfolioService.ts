import { Portfolio } from '../models/Portfolio';
import { User } from '../models/User';
import { Template } from '../models/Template';
import { PortfolioData } from '../types/portfolio.types';
import { UserPortfolioData } from '../types/user.types';
import { AppError } from '../utils/errorHandler';
import { ERROR_MESSAGES } from '../constants/httpStatus';
import { SlugGenerator } from '../utils/slugGenerator';
import { Types } from 'mongoose';

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

    const template = await Template.findById(portfolioData.templateId);
    
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    if (!template.isActive) {
      throw new AppError('Template is not active', 400);
    }

    const uniqueSlug = await SlugGenerator.generateUniqueSlug(portfolioData.name);

    const portfolio = await Portfolio.create({
      ...portfolioData,
      slug: uniqueSlug,
      userId: user._id,
      templateId: template._id,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { portfolios: portfolio._id },
      $inc: { portfolioCount: 1 }
    });

    return portfolio;
  }

  static async createPortfolioFromProfile(
    userId: string, 
    templateId: string, 
    name: string, 
    profileData: UserPortfolioData
  ) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    if (user.portfolioCount >= 2) {
      throw new AppError('Users can only create up to 2 portfolios', 400);
    }

    const template = await Template.findById(templateId);
    
    if (!template) {
      throw new AppError('Template not found', 404);
    }

    if (!template.isActive) {
      throw new AppError('Template is not active', 400);
    }

    const slug = await SlugGenerator.generateUniqueSlug(name);

    const portfolioData: PortfolioData = {
      name,
      slug,
      description: profileData.personalInfo.about || '',
      templateId: new Types.ObjectId(templateId),
      userId: user._id,
      isPublic: true,
      viewCount: 0,
      personalInfo: {
        fullName: profileData.personalInfo.fullName || user.name,
        jobTitle: profileData.personalInfo.jobTitle || '',
        location: profileData.personalInfo.location || '',
        email: profileData.personalInfo.email || user.email,
        phone: profileData.personalInfo.phone,
        website: profileData.personalInfo.website,
        avatar: user.avatar,
        about: profileData.personalInfo.about || '',
      },
      experience: profileData.experience.map(exp => ({
        id: new Types.ObjectId().toString(),
        company: exp.company || '',
        position: exp.position || '',
        location: exp.location || '',
        startDate: exp.startMonth && exp.startYear ? `${exp.startMonth} ${exp.startYear}` : '',
        endDate: exp.endMonth && exp.endYear ? `${exp.endMonth} ${exp.endYear}` : undefined,
        current: exp.current || false,
        contribution: exp.achievements || [],
      })),
      education: profileData.education.map(edu => ({
        id: new Types.ObjectId().toString(),
        institution: edu.institution || '',
        degree: edu.degree || '',
        field: edu.field || '',
        startDate: edu.startYear || '',
        endDate: edu.endYear,
        current: edu.current || false,
      })),
      projects: profileData.projects.map(proj => ({
        id: new Types.ObjectId().toString(),
        name: proj.name || '',
        description: proj.description || '',
        technologies: proj.technologies || [],
        startDate: proj.startDate || '',
        endDate: proj.endDate,
        current: !proj.endDate,
        links: (proj.links || []).map(link => ({
          url: link,
          label: link.includes('github') ? 'GitHub' : link.includes('demo') ? 'Demo' : 'Website'
        })),
      })),
      skills: profileData.skills.flatMap(skill => 
        (skill.skills || []).map(skillName => ({
          name: skillName || '',
          category: skill.category || '',
        }))
      ),
    };

    const portfolio = await Portfolio.create(portfolioData);

    await User.findByIdAndUpdate(userId, {
      $push: { portfolios: portfolio._id },
      $inc: { portfolioCount: 1 },
    });

    return portfolio;
  }

  static async updatePortfolio(userId: string, portfolioId: string, portfolioData: PortfolioData) {
    const existingPortfolio = await Portfolio.findOne({ _id: portfolioId, userId: userId });

    if (!existingPortfolio) {
      throw new AppError('Portfolio not found or access denied', 404);
    }

    const updateData: Partial<PortfolioData> = {};

    if (portfolioData.name !== undefined) {
      updateData.name = portfolioData.name;
    }
    
    if (portfolioData.description !== undefined) {
      updateData.description = portfolioData.description;
    }
    
    if (portfolioData.isPublic !== undefined) {
      updateData.isPublic = portfolioData.isPublic;
    }
    
    if (portfolioData.personalInfo !== undefined) {
      updateData.personalInfo = portfolioData.personalInfo;
    }
    
    if (portfolioData.experience !== undefined) {
      updateData.experience = portfolioData.experience;
    }
    
    if (portfolioData.education !== undefined) {
      updateData.education = portfolioData.education;
    }
    
    if (portfolioData.skills !== undefined) {
      updateData.skills = portfolioData.skills;
    }
    
    if (portfolioData.projects !== undefined) {
      updateData.projects = portfolioData.projects;
    }

    if (portfolioData.templateId && portfolioData.templateId.toString() !== existingPortfolio.templateId.toString()) {
      const template = await Template.findById(portfolioData.templateId);
      
      if (!template) {
        throw new AppError('Template not found', 404);
      }

      if (!template.isActive) {
        throw new AppError('Template is not active', 400);
      }

      updateData.templateId = new Types.ObjectId(portfolioData.templateId.toString());
    }

    if (portfolioData.name && portfolioData.name !== existingPortfolio.name) {
      const uniqueSlug = await SlugGenerator.generateUniqueSlug(portfolioData.name, portfolioId);
      updateData.slug = uniqueSlug;
    }

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: portfolioId, userId: userId },
      updateData,
      { new: true }
    );

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

  static async checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
    return await SlugGenerator.isSlugAvailable(slug, excludeId);
  }

  static async getPortfoliosByTemplate(templateId: string) {
    try {
      const portfolios = await Portfolio.find({ templateId, isPublic: true })
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean();

      return portfolios;
    } catch (error) {
      throw new AppError('Failed to fetch portfolios by template', 500);
    }
  }

  static async getPortfolioWithTemplate(portfolioId: string) {
    try {
      const portfolio = await Portfolio.findById(portfolioId)
        .populate('templateId')
        .populate('userId', 'name email')
        .lean();

      if (!portfolio) {
        throw new AppError('Portfolio not found', 404);
      }

      return portfolio;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch portfolio with template', 500);
    }
  }
}
