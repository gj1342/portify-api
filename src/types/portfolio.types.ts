import { PersonalInfo as SharedPersonalInfo, WorkExperience as SharedWorkExperience, Education as SharedEducation, Project as SharedProject, Skill as SharedSkill } from './shared.types';

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'behance' | 'dribbble' | 'medium' | 'devto' | 'personal';
  url: string;
  label?: string;
}

export interface PersonalInfo extends SharedPersonalInfo {
  fullName: string;        // Required in portfolio
  jobTitle: string;        // Required in portfolio (was 'title')
  location: string;        // Required in portfolio
  email: string;           // Required in portfolio
  about: string;           // Required in portfolio (was 'bio')
  socialLinks?: SocialLink[];
}

export interface WorkExperience extends SharedWorkExperience {
  id: string;
  company: string;         // Required in portfolio
  position: string;        // Required in portfolio
  location: string;        // Required in portfolio
  startDate: string;       // Required in portfolio (combined from startMonth + startYear)
  endDate?: string;        // Combined from endMonth + endYear
  current: boolean;        // Required in portfolio
  contribution: string[];  // Required in portfolio (was 'achievements')
}

export interface Education extends SharedEducation {
  id: string;
  institution: string;     // Required in portfolio
  degree: string;          // Required in portfolio
  field: string;           // Required in portfolio
  startDate: string;       // Required in portfolio (combined from startYear)
  endDate?: string;        // Combined from endYear
  current: boolean;        // Required in portfolio
}

export interface Project extends SharedProject {
  id: string;
  name: string;            // Required in portfolio
  description: string;     // Required in portfolio
  startDate: string;       // Required in portfolio
  current: boolean;        // Required in portfolio
  links?: Array<{
    label?: string;
    url: string;
  }>;
}

export interface Skill extends SharedSkill {
  name: string;            // Required in portfolio (single skill name)
  category?: string;
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
