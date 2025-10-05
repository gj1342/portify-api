import { User } from '../models/User';
import { UserDocument } from '../types/user.types';
import { CLOUDINARY_AVATAR_FOLDER, signUpload } from '../config/cloudinary';
import env from '../config/env';
import crypto from 'crypto';

export class UserService {
  static async uploadAvatar(userId: string, buffer: Buffer, filename: string, mimetype: string) {
    const { secure_url, public_id } = await this.uploadToCloudinary(buffer, filename, mimetype);
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        avatar: secure_url,
        $set: {
          'profileData.personalInfo.avatar': secure_url
        }
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      avatarUrl: secure_url,
      publicId: public_id,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        avatar: updatedUser.avatar,
        profileData: updatedUser.profileData
      }
    };
  }

  private static async uploadToCloudinary(buffer: Buffer, filename: string, mimetype: string) {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = CLOUDINARY_AVATAR_FOLDER;
    const publicId = `user_${timestamp}_${crypto.randomBytes(8).toString('hex')}`;
    const signature = signUpload({ folder, public_id: publicId, timestamp } as any);

    const blob = new Blob([buffer], { type: mimetype });
    const form = new FormData();
    form.append('file', blob, filename);
    form.append('api_key', env.CLOUDINARY_API_KEY);
    form.append('timestamp', String(timestamp));
    form.append('signature', signature);
    form.append('folder', folder);
    form.append('public_id', publicId);

    const res = await (globalThis as any).fetch(`https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form as any,
    });
    
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text);
    }
    
    const json = await res.json() as { secure_url: string; public_id: string };
    return json;
  }
}
