import { Router } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import { SUCCESS_MESSAGES } from '../constants/httpStatus';

const router = Router();

router.get('/health', (req, res) => {
  return ResponseHelper.success(res, null, 'Portify API is running');
});

router.get('/', (req, res) => {
  return ResponseHelper.success(res, { version: '1.0.0' }, 'Welcome to Portify API');
});

export default router;
