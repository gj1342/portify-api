export interface PersonalInfo {
  fullName?: string;
  jobTitle?: string;
  location?: string;
  email?: string;
  phone?: string;
  website?: string;
  avatar?: string;
  about?: string;
}

export interface WorkExperience {
  company?: string;
  position?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  description?: string;
  location?: string;
  achievements?: string[];
  current?: boolean;
}

export interface Education {
  institution?: string;
  degree?: string;
  field?: string;
  startYear?: string;
  endYear?: string;
  current?: boolean;
}

export interface Project {
  name?: string;
  description?: string;
  technologies?: string[];
  startDate?: string;
  endDate?: string;
  links?: string[];
}

export interface Skill {
  category?: string;
  skills?: string[];
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  projects: Project[];
  skills: Skill[];
}
