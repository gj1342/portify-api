import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PortfolioController } from '../controllers/portfolioController';
import { validateRequest, portfolioValidationSchema } from '../utils/validation';

const router = Router();

router.get('/me', authenticateToken, PortfolioController.getUserProfile);

router.post(
  '/',
  authenticateToken,
  validateRequest({ body: portfolioValidationSchema }),
  PortfolioController.createPortfolio
);

router.put(
  '/:portfolioId',
  authenticateToken,
  validateRequest({ body: portfolioValidationSchema }),
  PortfolioController.updatePortfolio
);

router.get(
  '/:portfolioId',
  authenticateToken,
  PortfolioController.getPortfolio
);

export default router;
