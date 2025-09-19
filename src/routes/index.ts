import { Router } from 'express';
import { ResponseHelper } from '../utils/responseHelper';
import { SUCCESS_MESSAGES } from '../constants/httpStatus';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the API is running and healthy
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API is healthy and running
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: null
 *                     message:
 *                       type: string
 *                       example: "Portify API is running"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/health', (req, res) => {
  return ResponseHelper.success(res, null, 'Portify API is running');
});

/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     description: Get basic information about the Portify API
 *     tags: [System]
 *     responses:
 *       200:
 *         description: API information retrieved successfully
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
 *                         version:
 *                           type: string
 *                           example: "1.0.0"
 *                     message:
 *                       type: string
 *                       example: "Welcome to Portify API"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', (req, res) => {
  return ResponseHelper.success(res, { version: '1.0.0' }, 'Welcome to Portify API');
});

export default router;
