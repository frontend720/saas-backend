import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authSchemas } from '../validators/auth.js';

const router = Router();

// Public
router.post('/register', validate(authSchemas.register), authController.register);
router.post('/login', validate(authSchemas.login), authController.login);
router.post('/refresh', authController.refresh);

// Protected
router.use(authenticate);
router.post('/logout', authController.logout);
router.get('/me', authController.getMe);
router.patch('/me', validate(authSchemas.updateProfile), authController.updateProfile);
router.post('/change-password', validate(authSchemas.changePassword), authController.changePassword);

export default router;
