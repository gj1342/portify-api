import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId;
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
  username?: string;
  portfolio: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
