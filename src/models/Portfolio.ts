import mongoose, { Document, Schema } from 'mongoose';
import { PortfolioData } from '../types/portfolio.types';

const PersonalInfoSchema = new Schema({
  fullName: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  bio: { type: String, required: true },
}, { _id: false });

const WorkExperienceSchema = new Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  contribution: [{ type: String }],
}, { _id: false });

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
}, { _id: false });

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  links: [{
    label: { type: String },
    url: { type: String, required: true }
  }],
}, { _id: false });

const SkillSchema = new Schema({
  name: { type: String, required: true },
  category: { type: String },
}, { _id: false });

const PortfolioSchema = new Schema<PortfolioData>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, maxlength: 100 },
  description: { type: String, maxlength: 200 },
  slug: { type: String, required: true },
  isPublic: { type: Boolean, default: true },
  viewCount: { type: Number, default: 0 },
  personalInfo: { type: PersonalInfoSchema, required: true },
  experience: [WorkExperienceSchema],
  education: [EducationSchema],
  skills: [SkillSchema],
  projects: [ProjectSchema],
}, {
  timestamps: true,
});

PortfolioSchema.index({ userId: 1 });
PortfolioSchema.index({ slug: 1 }, { unique: true });
PortfolioSchema.index({ isPublic: 1 });

export const Portfolio = mongoose.model<PortfolioData>('Portfolio', PortfolioSchema);
