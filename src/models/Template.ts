import mongoose, { Document, Schema } from 'mongoose';

export interface TemplateConfig {
  sections: {
    personalInfo: {
      enabled: boolean;
      fields: string[];
      layout: 'compact' | 'detailed';
      showSocialLinks: boolean;
      socialLinksStyle: 'icons' | 'buttons' | 'text';
      maxSocialLinks: number;
      showPhone: boolean;
      showWebsite: boolean;
      showLocation: boolean;
    };
    experience: {
      enabled: boolean;
      maxItems: number;
      showDuration: boolean;
      showLocation: boolean;
      showContribution: boolean;
      showCurrent: boolean;
    };
    education: {
      enabled: boolean;
      maxItems: number;
      showField: boolean;
      showCurrent: boolean;
    };
    skills: {
      enabled: boolean;
      maxItems: number;
      groupByCategory: boolean;
    };
    projects: {
      enabled: boolean;
      maxItems: number;
      showTechnologies: boolean;
      showProjectLinks: boolean;
      showDuration: boolean;
      showCurrent: boolean;
    };
  };
  styling: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    layout: 'single-column' | 'two-column';
  };
}

export interface TemplateData {
  _id?: string;
  name: string;
  description: string;
  category: 'professional' | 'creative' | 'academic' | 'minimalist';
  previewImage?: string;
  thumbnailImage?: string;
  config: TemplateConfig;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const TemplateConfigSchema = new Schema({
  sections: {
    personalInfo: {
      enabled: { type: Boolean, default: true },
      fields: [{ type: String }],
      layout: { type: String, enum: ['compact', 'detailed'], default: 'detailed' },
      showSocialLinks: { type: Boolean, default: true },
      socialLinksStyle: { type: String, enum: ['icons', 'buttons', 'text'], default: 'icons' },
      maxSocialLinks: { type: Number, default: 6 },
      showPhone: { type: Boolean, default: true },
      showWebsite: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true }
    },
    experience: {
      enabled: { type: Boolean, default: true },
      maxItems: { type: Number, default: 5 },
      showDuration: { type: Boolean, default: true },
      showLocation: { type: Boolean, default: true },
      showContribution: { type: Boolean, default: true },
      showCurrent: { type: Boolean, default: true }
    },
    education: {
      enabled: { type: Boolean, default: true },
      maxItems: { type: Number, default: 3 },
      showField: { type: Boolean, default: true },
      showCurrent: { type: Boolean, default: true }
    },
    skills: {
      enabled: { type: Boolean, default: true },
      maxItems: { type: Number, default: 20 },
      groupByCategory: { type: Boolean, default: true }
    },
    projects: {
      enabled: { type: Boolean, default: true },
      maxItems: { type: Number, default: 4 },
      showTechnologies: { type: Boolean, default: true },
      showProjectLinks: { type: Boolean, default: true },
      showDuration: { type: Boolean, default: true },
      showCurrent: { type: Boolean, default: true }
    }
  },
  styling: {
    primaryColor: { type: String, default: '#8B5CF6' },
    secondaryColor: { type: String, default: '#F3F4F6' },
    fontFamily: { type: String, default: 'Inter' },
    layout: { type: String, enum: ['single-column', 'two-column'], default: 'single-column' }
  }
}, { _id: false });

const TemplateSchema = new Schema<TemplateData>({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true, maxlength: 200 },
  category: { 
    type: String, 
    enum: ['professional', 'creative', 'academic', 'minimalist'], 
    required: true 
  },
  previewImage: { type: String, required: false },
  thumbnailImage: { type: String, required: false },
  config: { type: TemplateConfigSchema, required: true },
  isActive: { type: Boolean, default: true },
  isDefault: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
}, {
  timestamps: true,
});

TemplateSchema.index({ category: 1, isActive: 1 });
TemplateSchema.index({ sortOrder: 1 });
TemplateSchema.index({ isDefault: 1 });

export const Template = mongoose.model<TemplateData>('Template', TemplateSchema);
