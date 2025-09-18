import mongoose, { Document, Schema } from 'mongoose';
import { PortfolioData } from '../types/portfolio.types';

const PersonalInfoSchema = new Schema({
  fullName: { type: String, required: true },
  title: { type: String, required: true },
  location: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  website: { type: String },
  summary: { type: String, required: true },
}, { _id: false });

const WorkExperienceSchema = new Schema({
  company: { type: String, required: true },
  position: { type: String, required: true },
  location: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  description: { type: String, required: true },
  achievements: [{ type: String }],
}, { _id: false });

const EducationSchema = new Schema({
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  field: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  gpa: { type: String },
  achievements: [{ type: String }],
}, { _id: false });

const ProjectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  technologies: [{ type: String }],
  startDate: { type: String, required: true },
  endDate: { type: String },
  current: { type: Boolean, default: false },
  url: { type: String },
  github: { type: String },
}, { _id: false });

const CustomizationsSchema = new Schema({
  template: { type: String, default: 'default' },
  colorScheme: { type: String, default: 'blue' },
  fontFamily: { type: String, default: 'inter' },
}, { _id: false });

const PortfolioSchema = new Schema<PortfolioData>({
  personalInfo: { type: PersonalInfoSchema, required: true },
  experience: [WorkExperienceSchema],
  education: [EducationSchema],
  skills: [{ type: String }],
  projects: [ProjectSchema],
  customizations: { type: CustomizationsSchema, default: () => ({}) },
}, {
  timestamps: true,
});

export const Portfolio = mongoose.model<PortfolioData>('Portfolio', PortfolioSchema);
