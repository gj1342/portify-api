import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { User } from '../models/User';
import { ResponseHelper } from '../utils/responseHelper';
import { ERROR_MESSAGES } from '../constants/httpStatus';
import { UserRole } from '../types/user.types';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      ResponseHelper.unauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token) as { sub: string; email: string; name: string; avatar: string; role: string };

    if (decoded.role !== 'admin') {
      ResponseHelper.forbidden(res, ERROR_MESSAGES.FORBIDDEN);
      return;
    }

    req.user = {
      _id: decoded.sub,
      email: decoded.email,
      name: decoded.name,
      avatar: decoded.avatar,
      role: decoded.role
    };

    next();
  } catch (error) {
    ResponseHelper.unauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
    return;
  }
};
