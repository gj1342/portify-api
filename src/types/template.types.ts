import { TemplateConfig } from '../models/Template';

export interface TemplateResponse {
  _id: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'academic' | 'minimalist';
  previewImage?: string;
  thumbnailImage?: string;
  config: TemplateConfig;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateRequest {
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'academic' | 'minimalist';
  previewImage?: string;
  thumbnailImage?: string;
  config: TemplateConfig;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  category?: 'professional' | 'creative' | 'academic' | 'minimalist';
  previewImage?: string;
  thumbnailImage?: string;
  config?: Partial<TemplateConfig>;
  isActive?: boolean;
  isDefault?: boolean;
  sortOrder?: number;
}

export interface TemplateListResponse {
  templates: TemplateResponse[];
  total: number;
  categories: {
    [key: string]: number;
  };
}

export interface TemplateFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
}
