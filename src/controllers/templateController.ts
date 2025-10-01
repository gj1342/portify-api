import { Request, Response } from 'express';
import { TemplateService } from '../services/templateService';
import { ResponseHelper } from '../utils/responseHelper';
import { 
  CreateTemplateRequest, 
  UpdateTemplateRequest, 
  TemplateFilters 
} from '../types/template.types';
import { asyncHandler, AppError } from '../utils/errorHandler';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '../constants/httpStatus';

export class TemplateController {
  static getAllTemplates = asyncHandler(async (req: Request, res: Response) => {
    const filters: TemplateFilters = {
      category: req.query.category as string,
      isActive: req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined,
      search: req.query.search as string
    };

    const result = await TemplateService.getAllTemplates(filters);
    
    return ResponseHelper.success(res, result, 'Templates fetched successfully');
  });

  static getTemplateById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError(ERROR_MESSAGES.MISSING_DATA, 400);
    }

    const template = await TemplateService.getTemplateById(id);
    
    return ResponseHelper.success(res, template, 'Template fetched successfully');
  });

  static getDefaultTemplate = asyncHandler(async (req: Request, res: Response) => {
    const template = await TemplateService.getDefaultTemplate();
    
    return ResponseHelper.success(res, template, 'Default template fetched successfully');
  });

  static getTemplateCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await TemplateService.getTemplateCategories();
    
    return ResponseHelper.success(res, categories, 'Template categories fetched successfully');
  });

  static createTemplate = asyncHandler(async (req: Request, res: Response) => {
    const templateData: CreateTemplateRequest = req.body;
    
    if (!templateData || Object.keys(templateData).length === 0) {
      throw new AppError(ERROR_MESSAGES.MISSING_DATA, 400);
    }
    
    const template = await TemplateService.createTemplate(templateData);
    
    return ResponseHelper.success(res, template, 'Template created successfully');
  });

  static updateTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updateData: UpdateTemplateRequest = req.body;
    
    if (!id) {
      throw new AppError(ERROR_MESSAGES.MISSING_DATA, 400);
    }

    if (!updateData || Object.keys(updateData).length === 0) {
      throw new AppError(ERROR_MESSAGES.MISSING_DATA, 400);
    }

    const template = await TemplateService.updateTemplate(id, updateData);
    
    return ResponseHelper.success(res, template, 'Template updated successfully');
  });

  static deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    if (!id) {
      throw new AppError(ERROR_MESSAGES.MISSING_DATA, 400);
    }

    const result = await TemplateService.deleteTemplate(id);
    
    return ResponseHelper.success(res, result, 'Template deleted successfully');
  });

  static uploadTemplateImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError('No file provided', 400);
    }

    const { buffer, originalname, mimetype } = req.file;
    const { templateId } = req.body;
    
    const result = await TemplateService.uploadTemplateImage(buffer, originalname, mimetype, templateId);
    
    const message = templateId 
      ? 'Template image uploaded and template updated successfully'
      : 'Template image uploaded successfully. Use originalUrl for full size, previewUrl for medium size, and thumbnailUrl for small size.';

    return ResponseHelper.success(res, result, message);
  });
}

