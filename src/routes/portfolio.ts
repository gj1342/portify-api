import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PortfolioController } from '../controllers/portfolioController';
import { validateRequest, portfolioValidationSchema } from '../utils/validation';
import env from '../config/env';
import { CLOUDINARY_AVATAR_FOLDER, ALLOWED_IMAGE_MIME_REGEX, MAX_IMAGE_SIZE_BYTES, signUpload } from '../config/cloudinary';
import multer from 'multer';
import crypto from 'crypto';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_IMAGE_MIME_REGEX.test(file.mimetype)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

async function uploadAvatarToCloudinary(buffer: Buffer, filename: string, mimetype: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = CLOUDINARY_AVATAR_FOLDER;
  const publicId = filename.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || `avatar_${timestamp}`;
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

/**
 * @swagger
 * /portfolio/avatar:
 *   post:
 *     summary: Upload an avatar image and get its public URL
 *     description: Accepts a multipart image file and uploads it to Cloudinary. Returns the secure URL to store in personalInfo.avatar.
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secureUrl:
 *                   type: string
 *                 publicId:
 *                   type: string
 *       400:
 *         description: Invalid file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Upload failed
 */
router.post('/avatar', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' });
    const { buffer, originalname, mimetype } = req.file;
    const { secure_url, public_id } = await uploadAvatarToCloudinary(buffer, originalname, mimetype);
    return res.json({ secureUrl: secure_url, publicId: public_id });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

/**
 * @swagger
 * /portfolio/me:
 *   get:
 *     summary: Get user profile with portfolios
 *     description: Retrieve the authenticated user's profile information along with all their portfolios
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/UserProfile'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.get('/me', authenticateToken, PortfolioController.getUserProfile);

/**
 * @swagger
 * /portfolio:
 *   post:
 *     summary: Create a new portfolio
 *     description: Create a new portfolio for the authenticated user. Users can create up to 2 portfolios.
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Portfolio'
 *           example:
 *             name: "My Professional Portfolio"
 *             description: "A showcase of my professional work and achievements"
 *             slug: "john-doe-portfolio"
 *             isPublic: true
 *             personalInfo:
 *               fullName: "John Doe"
 *               title: "Senior Software Engineer"
 *               location: "San Francisco, CA"
 *               email: "john.doe@example.com"
 *               phone: "+1 (555) 123-4567"
 *               website: "https://johndoe.com"
 *               bio: "Passionate software engineer with 5+ years of experience in full-stack development."
 *             experience:
 *               - company: "Tech Corp"
 *                 position: "Senior Software Engineer"
 *                 location: "San Francisco, CA"
 *                 startDate: "2022-01"
 *                 endDate: "2024-01"
 *                 current: false
 *                 contribution: ["Improved system performance by 40%", "Led team of 5 developers"]
 *             education:
 *               - institution: "Stanford University"
 *                 degree: "Bachelor of Science"
 *                 field: "Computer Science"
 *                 startDate: "2018-09"
 *                 endDate: "2022-06"
 *                 current: false
 *             skills:
 *               - name: "JavaScript"
 *                 category: "Programming Languages"
 *               - name: "React"
 *                 category: "Frontend Frameworks"
 *             projects:
 *               - name: "E-commerce Platform"
 *                 description: "Full-stack e-commerce platform built with React and Node.js"
 *                 technologies: ["React", "Node.js", "MongoDB", "Express"]
 *                 startDate: "2023-01"
 *                 endDate: "2023-06"
 *                 current: false
 *                 links:
 *                   - label: "Live Demo"
 *                     url: "https://ecommerce-demo.com"
 *                   - label: "GitHub"
 *                     url: "https://github.com/johndoe/ecommerce-platform"
 *     responses:
 *       201:
 *         description: Portfolio created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Bad request - Validation failed or user has reached portfolio limit
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
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
router.post(
  '/',
  authenticateToken,
  validateRequest({ body: portfolioValidationSchema }),
  PortfolioController.createPortfolio
);

/**
 * @swagger
 * /portfolio/{portfolioId}:
 *   put:
 *     summary: Update an existing portfolio
 *     description: Update an existing portfolio owned by the authenticated user
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Portfolio'
 *     responses:
 *       200:
 *         description: Portfolio updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Portfolio'
 *       400:
 *         description: Bad request - Validation failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Portfolio not found or access denied
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
router.put(
  '/:portfolioId',
  authenticateToken,
  validateRequest({ body: portfolioValidationSchema }),
  PortfolioController.updatePortfolio
);

/**
 * @swagger
 * /portfolio/{portfolioId}:
 *   get:
 *     summary: Get a specific portfolio
 *     description: Retrieve a specific portfolio owned by the authenticated user
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Portfolio'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Portfolio not found or access denied
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
router.get(
  '/:portfolioId',
  authenticateToken,
  PortfolioController.getPortfolio
);

/**
 * @swagger
 * /portfolio/{portfolioId}:
 *   delete:
 *     summary: Delete a portfolio
 *     description: Delete a specific portfolio owned by the authenticated user
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: portfolioId
 *         required: true
 *         schema:
 *           type: string
 *         description: Portfolio ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Portfolio deleted successfully
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
 *                         message:
 *                           type: string
 *                           example: "Portfolio deleted successfully"
 *                         deletedPortfolio:
 *                           $ref: '#/components/schemas/Portfolio'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Portfolio not found or access denied
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
router.delete(
  '/:portfolioId',
  authenticateToken,
  PortfolioController.deletePortfolio
);

/**
 * @swagger
 * /portfolio/slug/{slug}:
 *   get:
 *     summary: Check if a portfolio slug is available
 *     description: Check if a portfolio slug is available for use
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug to check
 *       - in: query
 *         name: portfolioId
 *         required: false
 *         schema:
 *           type: string
 *         description: Portfolio ID to exclude from check (for updates)
 *     responses:
 *       200:
 *         description: Slug availability checked
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     slug:
 *                       type: string
 *                     isAvailable:
 *                       type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/slug/:slug',
  authenticateToken,
  PortfolioController.checkSlugAvailability
);

export default router;
