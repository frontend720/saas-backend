import { catchAsync } from '../utils/AppError.js';
import { success, created } from '../utils/response.js';
import authService from '../services/authService.js';

export const register = catchAsync(async (req, res) => {
  const result = await authService.register(req.body);
  created(res, result);
});

export const login = catchAsync(async (req, res) => {
  const result = await authService.login(req.body);
  success(res, result);
});

export const refresh = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshAccessToken(refreshToken);
  success(res, tokens);
});

export const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user._id);
  success(res, { message: 'Logged out' });
});

export const getMe = catchAsync(async (req, res) => {
  success(res, { user: req.user.toJSON() });
});

export const updateProfile = catchAsync(async (req, res) => {
  const user = req.user;
  Object.assign(user, req.body);
  await user.save({ validateBeforeSave: true });
  success(res, { user: user.toJSON() });
});

export const changePassword = catchAsync(async (req, res) => {
  const tokens = await authService.changePassword(req.user._id, req.body);
  success(res, { message: 'Password changed', ...tokens });
});
