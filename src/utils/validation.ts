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
  personalInfo: Joi.object({
    fullName: Joi.string().required(),
    title: Joi.string().required(),
    location: Joi.string().required(),
    email: Joi.string().email().required(),
    phone: Joi.string().optional(),
    website: Joi.string().uri().optional(),
    summary: Joi.string().required(),
  }).required(),
  experience: Joi.array().items(
    Joi.object({
      company: Joi.string().required(),
      position: Joi.string().required(),
      location: Joi.string().required(),
      startDate: Joi.string().required(),
      endDate: Joi.string().optional(),
      current: Joi.boolean().default(false),
      description: Joi.string().required(),
      achievements: Joi.array().items(Joi.string()),
    })
  ),
  education: Joi.array().items(
    Joi.object({
      institution: Joi.string().required(),
      degree: Joi.string().required(),
      field: Joi.string().required(),
      startDate: Joi.string().required(),
      endDate: Joi.string().optional(),
      current: Joi.boolean().default(false),
      gpa: Joi.string().optional(),
      achievements: Joi.array().items(Joi.string()),
    })
  ),
  skills: Joi.array().items(Joi.string()),
  projects: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
      technologies: Joi.array().items(Joi.string()),
      startDate: Joi.string().required(),
      endDate: Joi.string().optional(),
      current: Joi.boolean().default(false),
      url: Joi.string().uri().optional(),
      github: Joi.string().uri().optional(),
    })
  ),
  customizations: Joi.object({
    template: Joi.string().default('default'),
    colorScheme: Joi.string().default('blue'),
    fontFamily: Joi.string().default('inter'),
  }).default({}),
});
