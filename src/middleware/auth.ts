import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';
import { ResponseHelper } from '../utils/responseHelper';
import { ERROR_MESSAGES } from '../constants/httpStatus';

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return ResponseHelper.unauthorized(res, 'No token provided');
    }

    const decoded = verifyToken<{ sub: string; email: string }>(token);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return ResponseHelper.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
    }

    req.user = user;
    next();
  } catch (error) {
    return ResponseHelper.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
  }
};
