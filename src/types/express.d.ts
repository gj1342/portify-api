import { UserDocument } from './user.types';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
