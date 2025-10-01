import mongoose, { Document, Schema, Types } from 'mongoose';
import { User as IUser, UserPortfolioData } from '../types/user.types';
import { PortfolioDataSchema } from '../schemas/sharedSchemas';

const UserSchema = new Schema<IUser>({
  googleId: { type: String, required: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  username: { type: String },
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },
  portfolios: [{ type: Schema.Types.ObjectId, ref: 'Portfolio' }],
  portfolioCount: { type: Number, default: 0, max: 2 },
  profileData: PortfolioDataSchema,
  onboardingCompleted: { type: Boolean, default: false },
}, {
  timestamps: true,
});

UserSchema.index({ googleId: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ username: 1 }, { unique: true, sparse: true });

UserSchema.pre('save', function(next) {
  if (this.portfolios && this.portfolios.length > 2) {
    return next(new Error('Users can only create up to 2 portfolios'));
  }
  this.portfolioCount = this.portfolios ? this.portfolios.length : 0;
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
export type UserDocument = IUser & Document;
