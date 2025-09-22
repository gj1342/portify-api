import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { PortfolioController } from '../controllers/portfolioController';
import { validateRequest, portfolioValidationSchema } from '../utils/validation';

const router = Router();

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

export default router;
