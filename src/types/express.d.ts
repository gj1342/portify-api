import { UserDocument } from './userDocument.types';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
