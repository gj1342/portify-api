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
  slug: Joi.string().required().pattern(/^[a-z0-9-]+$/).messages({
    'string.empty': 'Portfolio slug is required',
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
    bio: Joi.string().required().max(500).messages({
      'string.empty': 'Bio is required',
      'string.max': 'Bio must not exceed 500 characters'
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
      description: Joi.string().required().max(1000).messages({
        'string.empty': 'Job description is required',
        'string.max': 'Description must not exceed 1000 characters'
      }),
      achievements: Joi.array().items(
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
      gpa: Joi.string().max(10).optional().allow('').messages({
        'string.max': 'GPA must not exceed 10 characters'
      }),
      achievements: Joi.array().items(
        Joi.string().max(200).messages({
          'string.max': 'Each achievement must not exceed 200 characters'
        })
      ).default([]),
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
      url: Joi.string().uri().optional().allow('').messages({
        'string.uri': 'Please provide a valid project URL'
      }),
      github: Joi.string().uri().optional().allow('').messages({
        'string.uri': 'Please provide a valid GitHub URL'
      }),
    })
  ).default([]),
});
