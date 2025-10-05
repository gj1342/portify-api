import crypto from 'crypto';
import env from './env';

export const cloudinary = {
  cloudName: env.CLOUDINARY_CLOUD_NAME,
  apiKey: env.CLOUDINARY_API_KEY,
  apiSecret: env.CLOUDINARY_API_SECRET,
};

export const CLOUDINARY_AVATAR_FOLDER = 'portify/avatars';
export const CLOUDINARY_TEMPLATE_FOLDER = 'portify/templates';
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_REGEX = /^image\/(jpeg|jpg|png|webp|gif|avif)$/;

export const signUpload = (params: { folder: string; public_id: string; timestamp: number }): string => {
  const base = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return crypto.createHash('sha1').update(`${base}${cloudinary.apiSecret}`).digest('hex');
};


