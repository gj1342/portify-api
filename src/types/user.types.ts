import { Document, Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  username?: string;
  portfolios: Types.ObjectId[];
  portfolioCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends Omit<User, '_id'>, Document {}
