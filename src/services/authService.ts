import { User } from '../models/User';
import { signToken } from '../utils/jwt';

export class AuthService {
  static async handleGoogleCallback(user: any) {
    const token = signToken({ sub: user._id, email: user.email });
    
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


  static createRedirectUrl(token: string, frontendUrl: string) {
    const redirectUrl = new URL(`${frontendUrl}/auth/success`);
    redirectUrl.searchParams.set('token', token);
    return redirectUrl.toString();
  }
}
