import { Router } from 'express';
import passport from 'passport';
import env from '../config/env';
import { AuthController } from '../controllers/authController';

const router = Router();

router.get('/google', passport.authenticate('google', {
  prompt: 'select_account',
}));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/auth/failure` }),
  AuthController.handleGoogleCallback
);

router.get('/validate', AuthController.validateToken);

export default router;


