import config from '../config/index.js';
import { AppError } from '../utils/AppError.js';

/**
 * Normalizes known Mongoose / JWT errors into AppErrors.
 */
const normalizeError = (err) => {
  // Mongoose validation
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return AppError.badRequest('Validation failed', details);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return AppError.conflict(`Duplicate value for '${field}'`);
  }

  // Mongoose bad ObjectId
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    return AppError.badRequest(`Invalid ID: ${err.value}`);
  }

  return err;
};

/**
 * Global error handler — must be registered LAST in the middleware chain.
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let error = normalizeError(err);

  // Default to 500 for unexpected errors
  const statusCode = error.statusCode || 500;
  const code = error.code || 'INTERNAL_ERROR';
  const message = error.isOperational ? error.message : 'Something went wrong';

  // Log non-operational (programmer) errors
  if (!error.isOperational) {
    console.error('[error] Unhandled error:', err);
  }

  const body = {
    success: false,
    error: {
      code,
      message,
    },
  };

  if (error.details) {
    body.error.details = error.details;
  }

  // In dev, include the stack trace
  if (config.isDev && !error.isOperational) {
    body.error.stack = err.stack;
  }

  res.status(statusCode).json(body);
};

export default errorHandler;
