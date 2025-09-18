import { Document, Types } from 'mongoose';

export interface UserDocument extends Document {
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
