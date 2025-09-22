import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Portify API',
    version: '1.0.0',
    description: 'Backend API for Portify - Modern Resume Portfolio Generator',
    contact: {
      name: 'Portify API Support',
      email: 'support@portify.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development server',
    },
    {
      url: 'https://api.portify.com/api/v1',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT token obtained from Google OAuth authentication',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Validation failed',
          },
          message: {
            type: 'string',
            example: 'Required fields are missing',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
          },
        },
        required: ['success', 'error', 'timestamp'],
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
            description: 'Response data',
          },
          message: {
            type: 'string',
            example: 'Operation completed successfully',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
          },
        },
        required: ['success', 'timestamp'],
      },
      PersonalInfo: {
        type: 'object',
        properties: {
          fullName: {
            type: 'string',
            maxLength: 100,
            example: 'John Doe',
            description: 'Full name of the person',
          },
          title: {
            type: 'string',
            maxLength: 100,
            example: 'Senior Software Engineer',
            description: 'Professional title or job position',
          },
          location: {
            type: 'string',
            maxLength: 100,
            example: 'San Francisco, CA',
            description: 'Current location',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
            description: 'Email address',
          },
          phone: {
            type: 'string',
            maxLength: 20,
            example: '+1 (555) 123-4567',
            description: 'Phone number (optional)',
          },
          website: {
            type: 'string',
            format: 'uri',
            example: 'https://johndoe.com',
            description: 'Personal website URL (optional)',
          },
          bio: {
            type: 'string',
            maxLength: 500,
            example: 'Passionate software engineer with 5+ years of experience in full-stack development.',
            description: 'Professional bio or summary',
          },
        },
        required: ['fullName', 'title', 'location', 'email', 'bio'],
      },
      WorkExperience: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'exp_123',
            description: 'Unique identifier for the experience entry',
          },
          company: {
            type: 'string',
            maxLength: 100,
            example: 'Tech Corp',
            description: 'Company name',
          },
          position: {
            type: 'string',
            maxLength: 100,
            example: 'Senior Software Engineer',
            description: 'Job position or role',
          },
          location: {
            type: 'string',
            maxLength: 100,
            example: 'San Francisco, CA',
            description: 'Work location',
          },
          startDate: {
            type: 'string',
            example: '2022-01',
            description: 'Start date (YYYY-MM format)',
          },
          endDate: {
            type: 'string',
            example: '2024-01',
            description: 'End date (YYYY-MM format), empty if current',
          },
          current: {
            type: 'boolean',
            example: false,
            description: 'Whether this is the current position',
          },
          contribution: {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 200,
            },
            example: ['Improved system performance by 40%', 'Led team of 5 developers'],
            description: 'Key contributions in this role',
          },
        },
        required: ['company', 'position', 'location', 'startDate'],
      },
      Education: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'edu_123',
            description: 'Unique identifier for the education entry',
          },
          institution: {
            type: 'string',
            maxLength: 100,
            example: 'Stanford University',
            description: 'Educational institution name',
          },
          degree: {
            type: 'string',
            maxLength: 100,
            example: 'Bachelor of Science',
            description: 'Degree type',
          },
          field: {
            type: 'string',
            maxLength: 100,
            example: 'Computer Science',
            description: 'Field of study',
          },
          startDate: {
            type: 'string',
            example: '2018-09',
            description: 'Start date (YYYY-MM format)',
          },
          endDate: {
            type: 'string',
            example: '2022-06',
            description: 'End date (YYYY-MM format), empty if current',
          },
          current: {
            type: 'boolean',
            example: false,
            description: 'Whether currently enrolled',
          },
        },
        required: ['institution', 'degree', 'field', 'startDate'],
      },
      Skill: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            maxLength: 50,
            example: 'JavaScript',
            description: 'Skill name',
          },
          category: {
            type: 'string',
            maxLength: 30,
            example: 'Programming Languages',
            description: 'Skill category (optional)',
          },
        },
        required: ['name'],
      },
      Project: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            example: 'proj_123',
            description: 'Unique identifier for the project',
          },
          name: {
            type: 'string',
            maxLength: 100,
            example: 'E-commerce Platform',
            description: 'Project name',
          },
          description: {
            type: 'string',
            maxLength: 1000,
            example: 'Full-stack e-commerce platform built with React and Node.js',
            description: 'Project description',
          },
          technologies: {
            type: 'array',
            items: {
              type: 'string',
              maxLength: 30,
            },
            example: ['React', 'Node.js', 'MongoDB', 'Express'],
            description: 'Technologies used in the project',
          },
          startDate: {
            type: 'string',
            example: '2023-01',
            description: 'Start date (YYYY-MM format)',
          },
          endDate: {
            type: 'string',
            example: '2023-06',
            description: 'End date (YYYY-MM format), empty if ongoing',
          },
          current: {
            type: 'boolean',
            example: false,
            description: 'Whether the project is currently ongoing',
          },
          links: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                label: { type: 'string', example: 'Live Demo' },
                url: { type: 'string', format: 'uri', example: 'https://ecommerce-demo.com' }
              },
              required: ['url']
            },
            description: 'Related links for the project (live demo, GitHub, design, etc.)'
          },
        },
        required: ['name', 'description', 'startDate'],
      },
      Portfolio: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            example: '507f1f77bcf86cd799439011',
            description: 'Portfolio ID',
          },
          userId: {
            type: 'string',
            example: '507f1f77bcf86cd799439012',
            description: 'User ID who owns this portfolio',
          },
          name: {
            type: 'string',
            maxLength: 100,
            example: 'My Professional Portfolio',
            description: 'Portfolio name',
          },
          description: {
            type: 'string',
            maxLength: 200,
            example: 'A showcase of my professional work and achievements',
            description: 'Portfolio description',
          },
          slug: {
            type: 'string',
            pattern: '^[a-z0-9-]+$',
            example: 'john-doe-portfolio',
            description: 'URL-friendly portfolio identifier',
          },
          isPublic: {
            type: 'boolean',
            example: true,
            description: 'Whether the portfolio is publicly accessible',
          },
          viewCount: {
            type: 'number',
            example: 42,
            description: 'Number of times the portfolio has been viewed',
          },
          personalInfo: {
            $ref: '#/components/schemas/PersonalInfo',
          },
          experience: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/WorkExperience',
            },
            description: 'Work experience entries',
          },
          education: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Education',
            },
            description: 'Education entries',
          },
          skills: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Skill',
            },
            description: 'Skills list',
          },
          projects: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Project',
            },
            description: 'Project entries',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
            description: 'Portfolio creation timestamp',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-15T10:30:00.000Z',
            description: 'Portfolio last update timestamp',
          },
        },
        required: ['name', 'slug', 'personalInfo'],
      },
      UserProfile: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                example: '507f1f77bcf86cd799439012',
              },
              name: {
                type: 'string',
                example: 'John Doe',
              },
              email: {
                type: 'string',
                format: 'email',
                example: 'john.doe@example.com',
              },
              avatar: {
                type: 'string',
                format: 'uri',
                example: 'https://lh3.googleusercontent.com/a/avatar.jpg',
              },
              portfolioCount: {
                type: 'number',
                example: 2,
              },
            },
          },
          portfolios: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Portfolio',
            },
          },
        },
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
