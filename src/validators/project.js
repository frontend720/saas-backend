import Joi from 'joi';

export const projectSchemas = {
  create: Joi.object({
    name: Joi.string().trim().min(1).max(200).required(),
    description: Joi.string().trim().max(2000).allow('').default(''),
    tags: Joi.array().items(Joi.string().trim().max(50)).max(20).default([]),
    settings: Joi.object().default({}),
  }),

  update: Joi.object({
    name: Joi.string().trim().min(1).max(200),
    description: Joi.string().trim().max(2000).allow(''),
    status: Joi.string().valid('draft', 'active', 'archived'),
    tags: Joi.array().items(Joi.string().trim().max(50)).max(20),
    settings: Joi.object(),
  }).min(1),

  addCollaborator: Joi.object({
    userId: Joi.string().hex().length(24).required(),
    role: Joi.string().valid('viewer', 'editor', 'admin').default('viewer'),
  }),

  idParam: Joi.object({
    id: Joi.string().hex().length(24).required(),
  }),

  slugParam: Joi.object({
    slug: Joi.string().trim().required(),
  }),
};
