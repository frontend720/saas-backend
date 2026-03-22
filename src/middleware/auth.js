import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// ---------------------------------------------------------------------------
// 1. The Pure Verification Engine (Used by GraphQL & REST)
// ---------------------------------------------------------------------------
export const verifyToken = async (token) => {
  if (!token) {
    throw AppError.unauthorized('No token provided.');
  }

  try {
    // 1. Decode the token (Make sure JWT_SECRET is in your .env)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Fetch the user from the database
    const user = await User.findById(decoded.sub || decoded.id);
    if (!user) {
      throw AppError.unauthorized('The user belonging to this token no longer exists.');
    }

    // 3. Check if they changed their password AFTER the token was issued
    // (This utilizes the instance method you built in User.js)
    if (user.changedPasswordAfter(decoded.iat)) {
      throw AppError.unauthorized('User recently changed password. Please log in again.');
    }

    // Return the sanitized user object
    return user;
  }catch (error) {
  if (error instanceof AppError) throw error; // re-throw your own errors untouched
  console.error('[auth] Token verification failed:', error.name, error.message);
  throw AppError.unauthorized('Invalid or expired token.');
}
};

// ---------------------------------------------------------------------------
// 2. The Express Middleware Wrapper (Used by REST routes)
// ---------------------------------------------------------------------------
export const authenticate = async (req, res, next) => {
  try {
    let token;

    // Extract the bearer token from the headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(AppError.unauthorized('You are not logged in. Please provide a token.'));
    }

    // Feed the token to our pure verification engine
    const user = await verifyToken(token);
    
    // Attach the user to the Express request object
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// 3. Role-Based Authorization (Used by Admin routes)
// ---------------------------------------------------------------------------
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(AppError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  };
};
