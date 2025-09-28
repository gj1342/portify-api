import { Router } from 'express';
import { TemplateController } from '../controllers/templateController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { validateRequest, templateValidationSchema } from '../utils/validation';
import { CLOUDINARY_TEMPLATE_FOLDER, ALLOWED_IMAGE_MIME_REGEX, MAX_IMAGE_SIZE_BYTES, signUpload } from '../config/cloudinary';
import env from '../config/env';
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

async function uploadTemplateImageToCloudinary(buffer: Buffer, filename: string, mimetype: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = CLOUDINARY_TEMPLATE_FOLDER;
  const publicId = `template_${filename.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40)}_${timestamp}`;
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
 * /templates/upload-image:
 *   post:
 *     summary: Upload template image and get preview/thumbnail URLs (Admin Only)
 *     description: Upload a high-quality template image to Cloudinary. Returns both preview and thumbnail URLs generated from the same image using Cloudinary transformations. Requires admin role.
 *     tags: [Templates]
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
 *                 description: High-quality template image file
 *     responses:
 *       200:
 *         description: Template image uploaded successfully with generated preview and thumbnail URLs
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
 *                         publicId:
 *                           type: string
 *                           example: 'portify/templates/template_professional_123'
 *                         previewUrl:
 *                           type: string
 *                           format: uri
 *                           example: 'https://res.cloudinary.com/portify/image/upload/w_800,h_600,c_fill/portify/templates/template_professional_123.jpg'
 *                         thumbnailUrl:
 *                           type: string
 *                           format: uri
 *                           example: 'https://res.cloudinary.com/portify/image/upload/w_300,h_225,c_fill/portify/templates/template_professional_123.jpg'
 *                         originalUrl:
 *                           type: string
 *                           format: uri
 *                           example: 'https://res.cloudinary.com/portify/image/upload/portify/templates/template_professional_123.jpg'
 *       400:
 *         description: Invalid file
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
 *         description: Upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/upload-image', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file provided' });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { secure_url, public_id } = await uploadTemplateImageToCloudinary(buffer, originalname, mimetype);
    
    const baseUrl = `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    return res.json({
      success: true,
      data: {
        publicId: public_id,
        originalUrl: secure_url,
        previewUrl: `${baseUrl}/w_800,h_600,c_fill/${public_id}.jpg`,
        thumbnailUrl: `${baseUrl}/w_300,h_225,c_fill/${public_id}.jpg`
      },
      message: 'Template image uploaded successfully with preview and thumbnail URLs generated',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Upload failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * @swagger
 * /templates:
 *   get:
 *     summary: Get all templates
 *     description: Retrieve all active templates with optional filtering by category and search
 *     tags: [Templates]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [professional, creative, academic, minimalist]
 *         description: Filter templates by category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search templates by name or description
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status (defaults to true)
 *     responses:
 *       200:
 *         description: Templates retrieved successfully
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
 *                         templates:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Template'
 *                         total:
 *                           type: number
 *                         categories:
 *                           type: object
 *                           additionalProperties:
 *                             type: number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', TemplateController.getAllTemplates);

/**
 * @swagger
 * /templates/categories:
 *   get:
 *     summary: Get template categories
 *     description: Retrieve all template categories with their counts
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           count:
 *                             type: number
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/categories', TemplateController.getTemplateCategories);

/**
 * @swagger
 * /templates/default:
 *   get:
 *     summary: Get default template
 *     description: Retrieve the default template that will be used when no specific template is selected
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: Default template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Template'
 *       404:
 *         description: No default template found
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
router.get('/default', TemplateController.getDefaultTemplate);

/**
 * @swagger
 * /templates/{id}:
 *   get:
 *     summary: Get template by ID
 *     description: Retrieve a specific template by its ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Template'
 *       404:
 *         description: Template not found
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
router.get('/:id', TemplateController.getTemplateById);

/**
 * @swagger
 * /templates:
 *   post:
 *     summary: Create a new template (Admin Only)
 *     description: Create a new template. Requires admin role.
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTemplateRequest'
 *     responses:
 *       201:
 *         description: Template created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Template'
 *       400:
 *         description: Bad request - Invalid data or template name already exists
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
router.post('/', authenticateToken, requireAdmin, validateRequest({ body: templateValidationSchema }), TemplateController.createTemplate);

/**
 * @swagger
 * /templates/{id}:
 *   put:
 *     summary: Update a template (Admin Only)
 *     description: Update an existing template. Requires admin role.
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTemplateRequest'
 *     responses:
 *       200:
 *         description: Template updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Template'
 *       400:
 *         description: Bad request - Invalid data or template name already exists
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
 *         description: Template not found
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
router.put('/:id', authenticateToken, requireAdmin, validateRequest({ body: templateValidationSchema }), TemplateController.updateTemplate);

/**
 * @swagger
 * /templates/{id}:
 *   delete:
 *     summary: Delete a template (Admin Only)
 *     description: Soft delete a template by setting isActive to false. Requires admin role.
 *     tags: [Templates]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Template ID
 *     responses:
 *       200:
 *         description: Template deleted successfully
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
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Template not found
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
router.delete('/:id', authenticateToken, requireAdmin, TemplateController.deleteTemplate);

export default router;
