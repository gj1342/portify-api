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
    
    const redirectUrl = AuthService.createRedirectUrl(token, process.env.FRONTEND_URL || 'http://localhost:3001');
    res.redirect(redirectUrl);
  });
}
