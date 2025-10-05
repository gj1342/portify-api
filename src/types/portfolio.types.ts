import { PersonalInfo as SharedPersonalInfo, WorkExperience as SharedWorkExperience, Education as SharedEducation, Project as SharedProject, Skill as SharedSkill } from './shared.types';

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'behance' | 'dribbble' | 'medium' | 'devto' | 'personal';
  url: string;
  label?: string;
}

export interface PersonalInfo extends SharedPersonalInfo {
  fullName: string;        // Required in portfolio
  jobTitle: string;        // Required in portfolio (matches frontend)
  location: string;        // Required in portfolio
  email: string;           // Required in portfolio
  about: string;           // Required in portfolio (matches frontend)
  socialLinks?: SocialLink[];
}

export interface WorkExperience extends SharedWorkExperience {
  id: string;
  company: string;         // Required in portfolio
  position: string;        // Required in portfolio
  location: string;        // Required in portfolio
  startMonth: string;      // Required in portfolio (matches frontend)
  startYear: string;       // Required in portfolio (matches frontend)
  endMonth?: string;       // Optional (matches frontend)
  endYear?: string;        // Optional (matches frontend)
  current: boolean;        // Required in portfolio
  achievements: string[];  // Required in portfolio (matches frontend)
}

export interface Education extends SharedEducation {
  id: string;
  institution: string;     // Required in portfolio
  degree: string;          // Required in portfolio
  field: string;           // Required in portfolio
  startYear: string;       // Required in portfolio (matches frontend)
  endYear?: string;        // Optional (matches frontend)
  current: boolean;        // Required in portfolio
}

export interface Project extends SharedProject {
  id: string;
  name: string;            // Required in portfolio
  description: string;     // Required in portfolio
  startMonth?: string;     // Optional in portfolio (matches frontend)
  startYear?: string;      // Optional in portfolio (matches frontend)
  endMonth?: string;       // Optional in portfolio (matches frontend)
  endYear?: string;        // Optional in portfolio (matches frontend)
  current: boolean;        // Required in portfolio
  links?: Array<{
    label?: string;
    url: string;
  }>;
}

export interface Skill extends SharedSkill {
  category: string;        // Required in portfolio (matches frontend)
  skills: string[];        // Required in portfolio (matches frontend)
}

import { Types } from 'mongoose';

export interface PortfolioData {
  _id?: string;
  userId: Types.ObjectId;
  templateId: Types.ObjectId;
  name: string;
  description?: string;
  slug: string;
  isPublic: boolean;
  viewCount: number;
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  projects: Project[];
  createdAt?: Date;
  updatedAt?: Date;
}
