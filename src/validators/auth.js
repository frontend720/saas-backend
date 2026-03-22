import Joi from 'joi';

export const authSchemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().min(8).max(128).required(),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
    password: Joi.string().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.string()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({ 'any.only': 'Passwords do not match' }),
  }),

  updateProfile: Joi.object({
    name: Joi.string().trim().min(2).max(100),
    avatar: Joi.string().uri().allow(null),
  }).min(1),
};
