import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { uploadSingle } from '../middleware/upload.js';
import { upload } from '../controllers/uploadController.js';

const router = Router();

router.use(authenticate);

router.post('/', uploadSingle, upload);

export default router;
