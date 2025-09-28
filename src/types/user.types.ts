import { Document, Types } from 'mongoose';

export type UserRole = 'user' | 'admin';

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
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends Omit<User, '_id'>, Document {
  _id: Types.ObjectId;
}
