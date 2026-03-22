import { Router } from 'express';
import * as assetController from '../controllers/assetController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { assetSchemas } from '../validators/asset.js';
import { checkAssetLimit } from '../middleware/tierLimits.js';
import { loadProject } from '../middleware/loadProject.js';

// mergeParams allows access to :projectId from parent router
const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', loadProject, validate(assetSchemas.create), checkAssetLimit, assetController.create);
router.get('/', assetController.list);
router.get('/usage', assetController.getStorageUsage);

router.get('/:id', assetController.getById);
router.patch('/:id', validate(assetSchemas.update), assetController.update);
router.delete('/:id', assetController.remove);

export default router;
