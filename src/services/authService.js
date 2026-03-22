import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import config from '../config/index.js';
import { User } from '../models/index.js';
import { AppError } from '../utils/AppError.js';

const signAccessToken = (user) =>
  jwt.sign(
    { sub: user._id, role: user.role, tier: user.tier },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { sub: user._id, type: 'refresh' },
    config.jwt.secret,
    { expiresIn: config.jwt.refreshExpiresIn }
  );

const hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

class AuthService {
  async register({ name, email, password }) {
    // Check for existing user
    const existing = await User.findOne({ email });
    if (existing) {
      throw AppError.conflict('Email already registered');
    }

    const user = await User.create({ name, email, password });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Store hashed refresh token
    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  async login({ email, password }) {
    const user = await User.findOne({ email, isActive: true }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  async refreshAccessToken(refreshToken) {
    if (!refreshToken) {
      throw AppError.unauthorized('No refresh token provided');
    }

    let decoded;
    try {
      decoded = jwt.verify(refreshToken, config.jwt.secret);
    } catch {
      throw AppError.unauthorized('Invalid or expired refresh token');
    }

    if (decoded.type !== 'refresh') {
      throw AppError.unauthorized('Invalid token type');
    }

    const user = await User.findById(decoded.sub).select('+refreshTokenHash');
    if (!user || !user.isActive) {
      throw AppError.unauthorized('User not found');
    }

    // Verify the refresh token matches the stored hash
    const hash = hashToken(refreshToken);
    if (user.refreshTokenHash !== hash) {
      // Possible token reuse attack — invalidate all sessions
      user.refreshTokenHash = null;
      await user.save({ validateBeforeSave: false });
      throw AppError.unauthorized('Token reuse detected. Please log in again.');
    }

    // Rotate refresh token
    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    user.refreshTokenHash = hashToken(newRefreshToken);
    await user.save({ validateBeforeSave: false });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshTokenHash: null });
  }

  async changePassword(userId, { currentPassword, newPassword }) {
    const user = await User.findById(userId).select('+password');
    if (!user) throw AppError.notFound('User not found');

    if (!(await user.comparePassword(currentPassword))) {
      throw AppError.unauthorized('Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshTokenHash = null; // Invalidate all sessions
    await user.save();

    // Issue fresh tokens
    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  }
}

export default new AuthService();
