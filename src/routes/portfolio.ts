import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PortfolioController } from '../controllers/portfolioController';
import { validateRequest, portfolioValidationSchema } from '../utils/validation';

const router = Router();

router.get('/me', authenticateToken, PortfolioController.getUserProfile);
router.put(
  '/me',
  authenticateToken,
  validateRequest({ body: portfolioValidationSchema }),
  PortfolioController.updateUserPortfolio
);

export default router;
