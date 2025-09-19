import { Router } from 'express';
import passport from 'passport';
import env from '../config/env';
import { AuthController } from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Initiate Google OAuth authentication
 *     description: Redirects user to Google OAuth consent screen for authentication
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirect to Google OAuth consent screen
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/google', passport.authenticate('google', {
  prompt: 'select_account',
}));

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Handle Google OAuth callback
 *     description: Processes the OAuth callback from Google and returns JWT token
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: Authorization code from Google
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: State parameter for CSRF protection
 *     responses:
 *       302:
 *         description: Redirect to frontend with JWT token or error
 *         headers:
 *           Location:
 *             description: Redirect URL with token or error
 *             schema:
 *               type: string
 *               example: "http://localhost:3000/auth/success?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${env.FRONTEND_URL}/auth/failure` }),
  AuthController.handleGoogleCallback
);

/**
 * @swagger
 * /auth/validate:
 *   get:
 *     summary: Validate JWT token
 *     description: Validates the provided JWT token and returns user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token is valid
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "507f1f77bcf86cd799439012"
 *                             name:
 *                               type: string
 *                               example: "John Doe"
 *                             email:
 *                               type: string
 *                               format: email
 *                               example: "john.doe@example.com"
 *                             avatar:
 *                               type: string
 *                               format: uri
 *                               example: "https://lh3.googleusercontent.com/a/avatar.jpg"
 *       401:
 *         description: Invalid or expired token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/validate', AuthController.validateToken);

export default router;


