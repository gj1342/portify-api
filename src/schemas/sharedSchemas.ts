import { Schema } from 'mongoose';

export const PersonalInfoSchema = new Schema({
  fullName: { type: String },
  jobTitle: { type: String },
  location: { type: String },
  email: { type: String },
  phone: { type: String },
  website: { type: String },
  avatar: { type: String },
  about: { type: String },
}, { _id: false });

export const WorkExperienceSchema = new Schema({
  company: { type: String },
  position: { type: String },
  startMonth: { type: String },
  startYear: { type: String },
  endMonth: { type: String },
  endYear: { type: String },
  description: { type: String },
  location: { type: String },
  achievements: [{ type: String }],
  current: { type: Boolean, default: false },
}, { _id: false });

export const EducationSchema = new Schema({
  institution: { type: String },
  degree: { type: String },
  field: { type: String },
  startYear: { type: String },
  endYear: { type: String },
  current: { type: Boolean, default: false },
}, { _id: false });

export const ProjectSchema = new Schema({
  name: { type: String },
  description: { type: String },
  technologies: [{ type: String }],
  startDate: { type: String },
  endDate: { type: String },
  links: [{ type: String }],
}, { _id: false });

export const SkillSchema = new Schema({
  category: { type: String },
  skills: [{ type: String }],
}, { _id: false });

export const PortfolioDataSchema = new Schema({
  personalInfo: PersonalInfoSchema,
  experience: [WorkExperienceSchema],
  education: [EducationSchema],
  projects: [ProjectSchema],
  skills: [SkillSchema],
}, { _id: false });
