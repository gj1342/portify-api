export interface PersonalInfo {
  fullName: string;
  title: string;
  location: string;
  email: string;
  phone?: string;
  website?: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description: string;
  achievements: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  gpa?: string;
  achievements: string[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  startDate: string;
  endDate?: string;
  current: boolean;
  url?: string;
  github?: string;
}

export interface PortfolioCustomizations {
  template: string;
  colorScheme: string;
  fontFamily: string;
}

export interface PortfolioData {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  projects: Project[];
  customizations: PortfolioCustomizations;
}
