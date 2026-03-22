import Joi from 'joi';

export const assetSchemas = {
  create: Joi.object({
    filename: Joi.string().trim().required(),
    originalName: Joi.string().trim().required(),
    mimeType: Joi.string().trim().required(),
    type: Joi.string().valid('image', 'video', 'document', 'audio', 'other').default('other'),
    size: Joi.number().integer().positive().required(),
    storageKey: Joi.string().trim().required(),
    url: Joi.string().allow(null).default(null),
    thumbnailUrl: Joi.string().allow(null).default(null),
    meta: Joi.object().default({}),
  }),

  update: Joi.object({
    filename: Joi.string().trim(),
    meta: Joi.object(),
    url: Joi.string().allow(null),
    thumbnailUrl: Joi.string().allow(null),
  }).min(1),
};
