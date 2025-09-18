import jwt from 'jsonwebtoken';
import env from '../config/env';

export const signToken = (payload: Record<string, unknown>): string => {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = <T = any>(token: string): T => {
  return jwt.verify(token, env.JWT_SECRET) as T;
};


