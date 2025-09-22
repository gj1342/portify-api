import dotenv from 'dotenv';
import { CONSOLE_MESSAGES, CONSOLE_FORMATS } from '../constants';

dotenv.config();

interface Environment {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
  BACKEND_URL: string;
  AUTH_GOOGLE_CALLBACK: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

const env: Environment = {
  PORT: parseInt(process.env.PORT || '3000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/portify',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3001',
  BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:3000',
  AUTH_GOOGLE_CALLBACK:
    process.env.AUTH_GOOGLE_CALLBACK || 'http://localhost:3000/api/v1/auth/google/callback',
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
};

export default env;

export const validateEnv = (): void => {
  const required = [
    'MONGODB_URI',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'JWT_SECRET',
    'FRONTEND_URL',
    'BACKEND_URL',
    'AUTH_GOOGLE_CALLBACK',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ] as const;

  const missing = required.filter((key) => !(process.env as Record<string, string | undefined>)[key]);
  if (missing.length > 0) {
    console.warn(CONSOLE_FORMATS.MISSING_ENV_LIST(missing));
    console.warn(CONSOLE_MESSAGES.USING_DEFAULTS);
  }
};
