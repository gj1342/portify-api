import mongoose, { Document, Schema } from 'mongoose';
import { PortfolioData } from '../types/portfolio.types';
import { 
  PersonalInfoSchema, 
  WorkExperienceSchema, 
  EducationSchema, 
  ProjectSchema, 
  SkillSchema 
} from '../schemas/sharedSchemas';

const SocialLinkSchema = new Schema({
  platform: { type: String, required: true, enum: ['linkedin', 'github', 'twitter', 'instagram', 'facebook', 'youtube', 'tiktok', 'behance', 'dribbble', 'medium', 'devto', 'personal'] },
  url: { type: String, required: true },
  label: { type: String },
}, { _id: false });

const PortfolioPersonalInfoSchema = new Schema({
  fullName: { type: String, required: true },
  jobTitle: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  avatar: { type: String },
  about: { type: String, required: true },
  socialLinks: [SocialLinkSchema],
}, { _id: false });

const PortfolioSchema = new Schema<PortfolioData>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: Schema.Types.ObjectId, ref: 'Template', required: true },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 200 },
  slug: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  personalInfo: { type: PortfolioPersonalInfoSchema, required: true },
  experience: [WorkExperienceSchema],
  education: [EducationSchema],
  skills: [SkillSchema],
  projects: [ProjectSchema],
}, {
  timestamps: true,
});

PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ templateId: 1 });
PortfolioSchema.index({ slug: 1 }, { unique: true });
PortfolioSchema.index({ isPublic: 1 });

export const Portfolio = mongoose.model<PortfolioData>('Portfolio', PortfolioSchema);
