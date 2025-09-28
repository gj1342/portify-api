import { Router } from 'express';
import passport from 'passport';
import env from '../config/env';
import { AuthController } from '../controllers/authController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Admin Setup
 *     description: Admin setup flow for initial admin configuration
 *   - name: Admin Management
 *     description: Admin user management (requires admin role)
 */

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

/**
 * @swagger
 * /auth/admin/promote:
 *   post:
 *     summary: Promote user to admin (Admin Only)
 *     description: Promote a user to admin role by email. Requires admin authentication.
 *     tags: [Authentication, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: User promoted to admin successfully
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
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439012"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "user@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         role:
 *                           type: string
 *                           enum: [admin]
 *                           example: "admin"
 *       400:
 *         description: Bad request - missing email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/admin/promote', authenticateToken, requireAdmin, AuthController.promoteToAdmin);

/**
 * @swagger
 * /auth/admin/demote:
 *   post:
 *     summary: Demote admin to user (Admin Only)
 *     description: Demote an admin user to regular user role by email. Requires admin authentication.
 *     tags: [Authentication, Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@example.com"
 *     responses:
 *       200:
 *         description: User demoted from admin successfully
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
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439012"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "admin@example.com"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         role:
 *                           type: string
 *                           enum: [user]
 *                           example: "user"
 *       400:
 *         description: Bad request - missing email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/admin/demote', authenticateToken, requireAdmin, AuthController.demoteFromAdmin);

/**
 * @swagger
 * /auth/admin/setup:
 *   post:
 *     summary: 🚀 Setup initial admin (First-time setup only)
 *     description: |
 *       **Promote the authenticated user to admin role**
 *       
 *       **Requirements:**
 *       - User must be authenticated via Google OAuth
 *       - No admin users can exist (first-time setup only)
 *       - Setup must be enabled in environment
 *       - User email must be in AUTHORIZED_ADMIN_EMAILS (if configured)
 *       
 *       **Steps:**
 *       1. Check setup status first: `GET /auth/admin/setup/status`
 *       2. Login via Google OAuth: `GET /auth/google`
 *       3. Call this endpoint with your JWT token
 *       
 *       **Returns:** New JWT token with admin role
 *     tags: [Authentication, Admin Setup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Initial admin setup completed successfully
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
 *                         token:
 *                           type: string
 *                           description: New JWT token with admin role
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         user:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "507f1f77bcf86cd799439012"
 *                             email:
 *                               type: string
 *                               format: email
 *                               example: "admin@example.com"
 *                             name:
 *                               type: string
 *                               example: "Admin User"
 *                             avatar:
 *                               type: string
 *                               format: uri
 *                               example: "https://lh3.googleusercontent.com/a/avatar.jpg"
 *                             role:
 *                               type: string
 *                               enum: [admin]
 *                               example: "admin"
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - setup disabled or email not authorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - admin already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/admin/setup', authenticateToken, AuthController.setupInitialAdmin);

/**
 * @swagger
 * /auth/admin/setup/status:
 *   get:
 *     summary: 🔧 Get admin setup status (Public endpoint)
 *     description: |
 *       **Check if admin setup is available and get setup information**
 *       
 *       This endpoint helps you understand:
 *       - Whether any admin users exist
 *       - If admin setup is currently allowed
 *       - Which emails are authorized for admin setup
 *       - Current environment information
 *       
 *       **Use this before attempting admin setup!**
 *     tags: [Authentication, Admin Setup]
 *     responses:
 *       200:
 *         description: Admin setup status retrieved successfully
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
 *                         hasAdmins:
 *                           type: boolean
 *                           description: Whether any admin users exist
 *                           example: false
 *                         canSetup:
 *                           type: boolean
 *                           description: Whether admin setup is currently allowed
 *                           example: true
 *                         authorizedEmails:
 *                           type: array
 *                           items:
 *                             type: string
 *                           nullable: true
 *                           description: List of authorized emails for admin setup (null if not restricted)
 *                           example: ["admin1@example.com", "admin2@example.com"]
 *                         environment:
 *                           type: string
 *                           enum: [development, production]
 *                           description: Current environment
 *                           example: "development"
 */
router.get('/admin/setup/status', AuthController.getAdminSetupStatus);

export default router;


