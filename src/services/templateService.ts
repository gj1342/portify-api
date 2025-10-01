import { Template } from '../models/Template';
import { TemplateData } from '../models/Template';
import { 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  TemplateListResponse, 
  TemplateFilters 
} from '../types/template.types';
import { AppError } from '../utils/errorHandler';
import { ERROR_MESSAGES } from '../constants/httpStatus';
import { CLOUDINARY_TEMPLATE_FOLDER, signUpload } from '../config/cloudinary';
import env from '../config/env';
import crypto from 'crypto';

export class TemplateService {
  static async getAllTemplates(filters: TemplateFilters = {}): Promise<TemplateListResponse> {
    try {
      const query: any = { isActive: true };
      
      if (filters.category) {
        query.category = filters.category;
      }
      
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { description: { $regex: filters.search, $options: 'i' } }
        ];
      }

      const templates = await Template.find(query)
        .sort({ sortOrder: 1, createdAt: -1 })
        .lean();

      const categories = await Template.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]);

      const categoryCounts = categories.reduce((acc, cat) => {
        acc[cat._id] = cat.count;
        return acc;
      }, {} as Record<string, number>);

      return {
        templates: templates.map(template => ({
          ...template,
          _id: template._id.toString(),
          createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
          updatedAt: template.updatedAt?.toISOString() || new Date().toISOString()
        })),
        total: templates.length,
        categories: categoryCounts
      };
    } catch (error) {
      throw new AppError('Failed to fetch templates', 500);
    }
  }

  static async getTemplateById(id: string) {
    try {
      const template = await Template.findById(id).lean();
      
      if (!template) {
        throw new AppError(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, 404);
      }

      return {
        ...template,
        _id: template._id.toString(),
        createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: template.updatedAt?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch template', 500);
    }
  }

  static async getDefaultTemplate() {
    try {
      const template = await Template.findOne({ isDefault: true, isActive: true }).lean();
      
      if (!template) {
        throw new AppError(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, 404);
      }

      return {
        ...template,
        _id: template._id.toString(),
        createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: template.updatedAt?.toISOString() || new Date().toISOString()
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to fetch default template', 500);
    }
  }

  static async createTemplate(data: CreateTemplateRequest) {
    try {
      if (data.isDefault) {
        await Template.updateMany({}, { isDefault: false });
      }

      const template = new Template(data);
      await template.save();

      return {
        ...template.toObject(),
        _id: template._id.toString(),
        createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: template.updatedAt?.toISOString() || new Date().toISOString()
      };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new AppError('Template name already exists', 400);
      }
      throw new AppError('Failed to create template', 500);
    }
  }

  static async updateTemplate(id: string, data: UpdateTemplateRequest) {
    try {
      if (data.isDefault) {
        await Template.updateMany({ _id: { $ne: id } }, { isDefault: false });
      }

      const template = await Template.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).lean();

      if (!template) {
        throw new AppError(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, 404);
      }

      return {
        ...template,
        _id: template._id.toString(),
        createdAt: template.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: template.updatedAt?.toISOString() || new Date().toISOString()
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      if (error.code === 11000) {
        throw new AppError('Template name already exists', 400);
      }
      throw new AppError('Failed to update template', 500);
    }
  }

  static async deleteTemplate(id: string) {
    try {
      const template = await Template.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!template) {
        throw new AppError(ERROR_MESSAGES.TEMPLATE_NOT_FOUND, 404);
      }

      return { message: 'Template deleted successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to delete template', 500);
    }
  }

  static async getTemplateCategories() {
    try {
      const categories = await Template.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      return categories.map(cat => ({
        name: cat._id,
        count: cat.count
      }));
    } catch (error) {
      throw new AppError('Failed to fetch template categories', 500);
    }
  }

  static async uploadTemplateImage(buffer: Buffer, filename: string, mimetype: string, templateId?: string) {
    try {
      const { secure_url, public_id } = await this.uploadToCloudinary(buffer, filename, mimetype);
      
      const baseUrl = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload`;
      
      const imageData = {
        publicId: public_id,
        originalUrl: secure_url,
        previewUrl: `${baseUrl}/c_limit,w_800,h_600,f_auto,q_auto/${public_id}`,
        thumbnailUrl: `${baseUrl}/c_limit,w_300,h_300,f_auto,q_auto/${public_id}`
      };

      let updatedTemplate = null;
      if (templateId) {
        try {
          updatedTemplate = await this.updateTemplate(templateId, {
            previewImage: imageData.previewUrl,
            thumbnailImage: imageData.thumbnailUrl
          });
        } catch (templateError) {
          console.warn('Template update failed:', templateError);
        }
      }

      return {
        ...imageData,
        ...(updatedTemplate && { updatedTemplate })
      };
    } catch (error) {
      throw new AppError('Failed to upload template image', 500);
    }
  }

  private static async uploadToCloudinary(buffer: Buffer, filename: string, mimetype: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = CLOUDINARY_TEMPLATE_FOLDER;
    const publicId = `template_${timestamp}_${crypto.randomBytes(8).toString('hex')}`;
    const signature = signUpload({ folder, public_id: publicId, timestamp } as any);

    const blob = new Blob([buffer], { type: mimetype });
    const form = new FormData();
    form.append('file', blob, filename);
    form.append('api_key', env.CLOUDINARY_API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);
    form.append('public_id', publicId);

    const res = await (globalThis as any).fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form as any,
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    
    const json = await res.json() as { secure_url: string; public_id: string };
    return json;
  }
}
