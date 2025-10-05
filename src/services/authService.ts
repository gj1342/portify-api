import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/errorHandler';
import { ERROR_MESSAGES } from '../constants/httpStatus';
import env from '../config/env';

export class AuthService {
  static async handleGoogleCallback(user: any) {
    const token = signToken({ 
      sub: user._id, 
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role
    });
    
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }


  static createRedirectUrl(token: string, user: any, frontendUrl: string) {
    const redirectUrl = new URL(`${frontendUrl}/auth/success`);
    redirectUrl.searchParams.set('token', token);
    redirectUrl.searchParams.set('user', JSON.stringify({
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    }));
    return redirectUrl.toString();
  }

  static async promoteToAdmin(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    user.role = 'admin';
    await user.save();

    return user;
  }

  static async demoteFromAdmin(email: string) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError(ERROR_MESSAGES.USER_NOT_FOUND, 404);
    }

    user.role = 'user';
    await user.save();

    return user;
  }

  static async setupInitialAdmin(user: any) {
    // Check if admin setup is enabled
    if (env.NODE_ENV === 'production' && !env.ENABLE_ADMIN_SETUP) {
      throw new AppError(ERROR_MESSAGES.ADMIN_SETUP_DISABLED, 403);
    }

    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      throw new AppError(ERROR_MESSAGES.ADMIN_ALREADY_EXISTS, 409);
    }

    // Check if user email is authorized for admin setup
    const authorizedEmails = env.AUTHORIZED_ADMIN_EMAILS?.split(',') || [];
    if (authorizedEmails.length > 0 && !authorizedEmails.includes(user.email)) {
      throw new AppError(ERROR_MESSAGES.INVALID_ADMIN_EMAIL, 403);
    }

    // Promote user to admin
    user.role = 'admin';
    await user.save();

    // Generate new token with admin role
    const token = signToken({ 
      sub: user._id, 
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role
    });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  static async getAdminSetupStatus() {
    const adminCount = await User.countDocuments({ role: 'admin' });
    const isSetupEnabled = env.NODE_ENV !== 'production' || env.ENABLE_ADMIN_SETUP;
    const authorizedEmails = env.AUTHORIZED_ADMIN_EMAILS?.split(',') || [];

    return {
      hasAdmins: adminCount > 0,
      canSetup: isSetupEnabled && adminCount === 0,
      authorizedEmails: authorizedEmails.length > 0 ? authorizedEmails : null,
      environment: env.NODE_ENV
    };
  }
}
