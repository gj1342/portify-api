import { User } from '../models/User';
import { signToken } from '../utils/jwt';

export class AuthService {
  static async handleGoogleCallback(user: any) {
    const token = signToken({ 
      sub: user._id, 
      email: user.email,
      name: user.name,
      avatar: user.avatar
    });
    
    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
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
    }));
    return redirectUrl.toString();
  }
}
