import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { ResponseHelper } from '../utils/responseHelper';
import { SUCCESS_MESSAGES } from '../constants/httpStatus';
import { asyncHandler } from '../utils/errorHandler';

export class AuthController {
  static handleGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user as any;
    const { token, user: userData } = await AuthService.handleGoogleCallback(user);
    
    if (req.query.test === 'true') {
      return ResponseHelper.success(res, { token, user: userData }, SUCCESS_MESSAGES.AUTH_SUCCESS);
    }
    
    const redirectUrl = AuthService.createRedirectUrl(token, user, process.env.FRONTEND_URL || 'http://localhost:3001');
    res.redirect(redirectUrl);
  });

  static validateToken = asyncHandler(async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return ResponseHelper.unauthorized(res, 'No token provided');
    }

    try {
      const { verifyToken } = await import('../utils/jwt');
      const decoded = verifyToken<{ sub: string; email: string; name: string; avatar: string }>(token);
      
      return ResponseHelper.success(res, { 
        valid: true, 
        user: {
          id: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          avatar: decoded.avatar
        }
      }, 'Token is valid');
    } catch (error) {
      return ResponseHelper.unauthorized(res, 'Invalid token');
    }
  });
}
