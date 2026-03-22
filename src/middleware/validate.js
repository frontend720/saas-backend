import { AppError } from '../utils/AppError.js';

/**
 * Creates Express middleware that validates req[source] against a Joi schema.
 *
 * Usage:
 *   import { userSchemas } from '../validators/user.js';
 *   router.post('/register', validate(userSchemas.register), controller.register);
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    errors: { wrap: { label: false } },
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return next(AppError.badRequest('Validation failed', details));
  }

  // Replace with sanitized values
  req[source] = value;
  next();
};

/**
 * Validate query params.
 */
export const validateQuery = (schema) => validate(schema, 'query');

/**
 * Validate URL params.
 */
export const validateParams = (schema) => validate(schema, 'params');
