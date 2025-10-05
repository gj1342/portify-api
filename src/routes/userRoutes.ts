import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';
import { ALLOWED_IMAGE_MIME_REGEX, MAX_IMAGE_SIZE_BYTES } from '../config/cloudinary';
import multer from 'multer';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_REGEX.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, JPG, PNG, WebP, GIF, AVIF)'));
    }
  },
});

/**
 * @swagger
 * /users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Retrieves the authenticated user's profile information including portfolio data
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                           example: "60d0fe4f5311236168a109ca"
 *                         name:
 *                           type: string
 *                           example: "John Doe"
 *                         email:
 *                           type: string
 *                           example: "john@example.com"
 *                         avatar:
 *                           type: string
 *                           example: "https://res.cloudinary.com/portify/image/upload/..."
 *                         onboardingCompleted:
 *                           type: boolean
 *                           example: true
 *                     profileData:
 *                       type: object
 *                       description: User's portfolio profile data
 *                 message:
 *                   type: string
 *                   example: "Profile retrieved successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.get('/profile', authenticateToken, UserController.getProfile);

/**
 * @swagger
 * /users/profile:
 *   put:
 *     summary: Update current user profile
 *     description: Updates the authenticated user's profile data and onboarding status
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               profileData:
 *                 type: object
 *                 description: User's portfolio profile data
 *                 properties:
 *                   personalInfo:
 *                     type: object
 *                     properties:
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       jobTitle:
 *                         type: string
 *                         example: "Software Developer"
 *                       email:
 *                         type: string
 *                         example: "john@example.com"
 *                       avatar:
 *                         type: string
 *                         example: "https://res.cloudinary.com/..."
 *                   experience:
 *                     type: array
 *                     items:
 *                       type: object
 *                   education:
 *                     type: array
 *                     items:
 *                       type: object
 *                   projects:
 *                     type: array
 *                     items:
 *                       type: object
 *                   skills:
 *                     type: array
 *                     items:
 *                       type: object
 *               onboardingCompleted:
 *                 type: boolean
 *                 description: Whether user has completed onboarding
 *                 example: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         onboardingCompleted:
 *                           type: boolean
 *                     profileData:
 *                       type: object
 *                       description: Updated profile data
 *                 message:
 *                   type: string
 *                   example: "User profile updated successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - Invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
router.put('/profile', authenticateToken, UserController.updateProfile);

/**
 * @swagger
 * /users/onboarding-status:
 *   get:
 *     summary: Check onboarding completion status
 *     description: Retrieves whether the authenticated user has completed the onboarding process
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Onboarding status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     onboardingCompleted:
 *                       type: boolean
 *                       example: true
 *                       description: Whether user has completed onboarding
 *                 message:
 *                   type: string
 *                   example: "Operation successful"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
router.get('/onboarding-status', authenticateToken, UserController.checkOnboardingStatus);

router.put('/:id', authenticateToken, UserController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user by ID
 *     description: Updates user information by ID. Users can only update their own profile unless they're admin.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               avatar:
 *                 type: string
 *                 format: uri
 *                 description: User's avatar URL
 *               profileData:
 *                 type: object
 *                 description: User's portfolio profile data
 *               onboardingCompleted:
 *                 type: boolean
 *                 description: Whether user has completed onboarding
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         avatar:
 *                           type: string
 *                         role:
 *                           type: string
 *                         onboardingCompleted:
 *                           type: boolean
 *                     profileData:
 *                       type: object
 *                       description: Updated profile data
 *                 message:
 *                   type: string
 *                   example: "User profile updated successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - Invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Can only update your own profile
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /users/avatar:
 *   post:
 *     summary: Upload user avatar image
 *     description: Uploads an avatar image to Cloudinary and updates the user's profile data. Uses the authenticated user's ID automatically.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (JPEG, JPG, PNG, WebP, GIF, AVIF only, max 5MB)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully and user profile updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://res.cloudinary.com/portify/image/upload/portify/avatars/user_1234567890_abcdef12.jpg"
 *                     publicId:
 *                       type: string
 *                       example: "portify/avatars/user_1234567890_abcdef12"
 *                     user:
 *                       type: object
 *                       description: Updated user profile data
 *                 message:
 *                   type: string
 *                   example: "Avatar uploaded and profile updated successfully"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - No file provided or invalid file type
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Upload failed
 */
router.post('/avatar', authenticateToken, upload.single('file'), UserController.uploadAvatar);

export default router;

