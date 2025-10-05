import { Document, Types } from 'mongoose';
import { PortfolioData } from './shared.types';

export type UserRole = 'user' | 'admin';

export type UserPortfolioData = PortfolioData;

export interface User {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  username?: string;
  role: UserRole;
  portfolios: Types.ObjectId[];
  portfolioCount: number;
  profileData?: UserPortfolioData;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends Omit<User, '_id'>, Document {
  _id: Types.ObjectId;
}
