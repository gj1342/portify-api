import mongoose, { Document, Schema, Types } from 'mongoose';
import { User as IUser } from '../types/user.types';

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  username: { type: String },
  portfolio: { type: Schema.Types.ObjectId, ref: 'Portfolio' },
}, {
  timestamps: true,
});

UserSchema.index({ googleId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });

export const User = mongoose.model<IUser>('User', UserSchema);
