import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ResponseHelper } from './responseHelper';
import { ERROR_MESSAGES } from '../constants/httpStatus';

export const validateRequest = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
}) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: string[] = [];

    if (schema.body) {
      const { error } = schema.body.validate(req.body);
      if (error) {
        errors.push(`Body: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.query) {
      const { error } = schema.query.validate(req.query);
      if (error) {
        errors.push(`Query: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (schema.params) {
      const { error } = schema.params.validate(req.params);
      if (error) {
        errors.push(`Params: ${error.details.map(d => d.message).join(', ')}`);
      }
    }

    if (errors.length > 0) {
      return ResponseHelper.badRequest(res, errors.join('; '));
    }

    next();
  };
};

export const portfolioValidationSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'string.empty': 'Portfolio name is required',
    'string.max': 'Portfolio name must not exceed 100 characters'
  }),
  description: Joi.string().max(200).optional().allow('').messages({
    'string.max': 'Portfolio description must not exceed 200 characters'
  }),
  slug: Joi.string().optional().pattern(/^[a-z0-9-]+$/).messages({
    'string.pattern.base': 'Slug must contain only lowercase letters, numbers, and hyphens'
  }),
  isPublic: Joi.boolean().default(true),
  personalInfo: Joi.object({
    fullName: Joi.string().required().max(100).messages({
      'string.empty': 'Full name is required',
      'string.max': 'Full name must not exceed 100 characters'
    }),
    title: Joi.string().required().max(100).messages({
      'string.empty': 'Professional title is required',
      'string.max': 'Title must not exceed 100 characters'
    }),
    location: Joi.string().required().max(100).messages({
      'string.empty': 'Location is required',
      'string.max': 'Location must not exceed 100 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
    phone: Joi.string().max(20).optional().allow('').messages({
      'string.max': 'Phone number must not exceed 20 characters'
    }),
    website: Joi.string().uri().optional().allow('').messages({
      'string.uri': 'Please provide a valid website URL'
    }),
    avatar: Joi.string().uri().optional().allow('').messages({
      'string.uri': 'Please provide a valid avatar URL'
    }),
    bio: Joi.string().required().max(500).messages({
      'string.empty': 'Bio is required',
      'string.max': 'Bio must not exceed 500 characters'
    }),
    socialLinks: Joi.array().items(
      Joi.object({
        platform: Joi.string().valid(
          'linkedin', 'github', 'twitter', 'instagram', 'facebook', 
          'youtube', 'tiktok', 'behance', 'dribbble', 'medium', 
          'devto', 'personal'
        ).required().messages({
          'string.empty': 'Social platform is required',
          'any.only': 'Invalid social platform'
        }),
        url: Joi.string().uri().required().messages({
          'string.empty': 'Social URL is required',
          'string.uri': 'Please provide a valid social URL'
        }),
        label: Joi.string().max(50).optional().allow('').messages({
          'string.max': 'Social link label must not exceed 50 characters'
        })
      })
    ).default([]).messages({
      'array.base': 'Social links must be an array'
    }),
  }).required(),
  experience: Joi.array().items(
    Joi.object({
      id: Joi.string().optional(),
      company: Joi.string().required().max(100).messages({
        'string.empty': 'Company name is required',
        'string.max': 'Company name must not exceed 100 characters'
      }),
      position: Joi.string().required().max(100).messages({
        'string.empty': 'Position is required',
        'string.max': 'Position must not exceed 100 characters'
      }),
      location: Joi.string().required().max(100).messages({
        'string.empty': 'Work location is required',
        'string.max': 'Location must not exceed 100 characters'
      }),
      startDate: Joi.string().required().messages({
        'string.empty': 'Start date is required'
      }),
      endDate: Joi.string().optional().allow(''),
      current: Joi.boolean().default(false),
      contribution: Joi.array().items(
        Joi.string().max(200).messages({
          'string.max': 'Each achievement must not exceed 200 characters'
        })
      ).default([]),
    })
  ).default([]),
  education: Joi.array().items(
    Joi.object({
      id: Joi.string().optional(),
      institution: Joi.string().required().max(100).messages({
        'string.empty': 'Institution name is required',
        'string.max': 'Institution name must not exceed 100 characters'
      }),
      degree: Joi.string().required().max(100).messages({
        'string.empty': 'Degree is required',
        'string.max': 'Degree must not exceed 100 characters'
      }),
      field: Joi.string().required().max(100).messages({
        'string.empty': 'Field of study is required',
        'string.max': 'Field must not exceed 100 characters'
      }),
      startDate: Joi.string().required().messages({
        'string.empty': 'Start date is required'
      }),
      endDate: Joi.string().optional().allow(''),
      current: Joi.boolean().default(false),
    })
  ).default([]),
  skills: Joi.array().items(
    Joi.object({
      name: Joi.string().required().max(50).messages({
        'string.empty': 'Skill name is required',
        'string.max': 'Skill name must not exceed 50 characters'
      }),
      category: Joi.string().max(30).optional().allow('').messages({
        'string.max': 'Skill category must not exceed 30 characters'
      }),
    })
  ).default([]),
  projects: Joi.array().items(
    Joi.object({
      id: Joi.string().optional(),
      name: Joi.string().required().max(100).messages({
        'string.empty': 'Project name is required',
        'string.max': 'Project name must not exceed 100 characters'
      }),
      description: Joi.string().required().max(1000).messages({
        'string.empty': 'Project description is required',
        'string.max': 'Description must not exceed 1000 characters'
      }),
      technologies: Joi.array().items(
        Joi.string().max(30).messages({
          'string.max': 'Each technology must not exceed 30 characters'
        })
      ).default([]),
      startDate: Joi.string().required().messages({
        'string.empty': 'Start date is required'
      }),
      endDate: Joi.string().optional().allow(''),
      current: Joi.boolean().default(false),
      links: Joi.array().items(
        Joi.object({
          label: Joi.string().max(50).optional().allow(''),
          url: Joi.string().uri().required().messages({
            'string.uri': 'Please provide a valid link URL'
          })
        })
      ).default([]),
    })
  ).default([]),
});

export const templateValidationSchema = Joi.object({
  name: Joi.string().required().max(100).messages({
    'string.empty': 'Template name is required',
    'string.max': 'Template name must not exceed 100 characters'
  }),
  description: Joi.string().required().max(200).messages({
    'string.empty': 'Template description is required',
    'string.max': 'Template description must not exceed 200 characters'
  }),
  category: Joi.string().valid('professional', 'creative', 'academic', 'minimalist').required().messages({
    'string.empty': 'Template category is required',
    'any.only': 'Invalid template category'
  }),
  previewImage: Joi.string().uri().optional().messages({
    'string.uri': 'Please provide a valid preview image URL'
  }),
  thumbnailImage: Joi.string().uri().optional().messages({
    'string.uri': 'Please provide a valid thumbnail image URL'
  }),
  config: Joi.object({
    sections: Joi.object({
      personalInfo: Joi.object({
        enabled: Joi.boolean().default(true),
        fields: Joi.array().items(Joi.string()).default([]),
        layout: Joi.string().valid('compact', 'detailed').default('detailed'),
        showSocialLinks: Joi.boolean().default(true),
        socialLinksStyle: Joi.string().valid('icons', 'buttons', 'text').default('icons'),
        maxSocialLinks: Joi.number().min(1).max(12).default(6),
        showPhone: Joi.boolean().default(true),
        showWebsite: Joi.boolean().default(true),
        showLocation: Joi.boolean().default(true)
      }).required(),
      experience: Joi.object({
        enabled: Joi.boolean().default(true),
        maxItems: Joi.number().min(1).max(20).default(5),
        showDuration: Joi.boolean().default(true),
        showLocation: Joi.boolean().default(true),
        showContribution: Joi.boolean().default(true),
        showCurrent: Joi.boolean().default(true)
      }).required(),
      education: Joi.object({
        enabled: Joi.boolean().default(true),
        maxItems: Joi.number().min(1).max(10).default(3),
        showField: Joi.boolean().default(true),
        showCurrent: Joi.boolean().default(true)
      }).required(),
      skills: Joi.object({
        enabled: Joi.boolean().default(true),
        maxItems: Joi.number().min(1).max(50).default(20),
        groupByCategory: Joi.boolean().default(true)
      }).required(),
      projects: Joi.object({
        enabled: Joi.boolean().default(true),
        maxItems: Joi.number().min(1).max(15).default(4),
        showTechnologies: Joi.boolean().default(true),
        showProjectLinks: Joi.boolean().default(true),
        showDuration: Joi.boolean().default(true),
        showCurrent: Joi.boolean().default(true)
      }).required()
    }).required(),
    styling: Joi.object({
      primaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#8B5CF6'),
      secondaryColor: Joi.string().pattern(/^#[0-9A-Fa-f]{6}$/).default('#F3F4F6'),
      fontFamily: Joi.string().max(50).default('Inter'),
      layout: Joi.string().valid('single-column', 'two-column').default('single-column')
    }).required()
  }).required(),
  isActive: Joi.boolean().default(true),
  isDefault: Joi.boolean().default(false),
  sortOrder: Joi.number().min(0).default(0)
});
