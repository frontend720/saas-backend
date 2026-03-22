import { Router } from 'express';
import * as projectController from '../controllers/projectController.js';
import { authenticate } from '../middleware/auth.js';
import { validate, validateParams } from '../middleware/validate.js';
import { projectSchemas } from '../validators/project.js';
import { checkProjectLimit } from '../middleware/tierLimits.js';

const router = Router();

router.use(authenticate);

router.post('/', validate(projectSchemas.create), checkProjectLimit, projectController.create);
router.get('/', projectController.list);

router.get('/slug/:slug', validateParams(projectSchemas.slugParam), projectController.getBySlug);

router.get('/:id', validateParams(projectSchemas.idParam), projectController.getById);
router.patch('/:id', validateParams(projectSchemas.idParam), validate(projectSchemas.update), projectController.update);
router.delete('/:id', validateParams(projectSchemas.idParam), projectController.remove);

// Collaborators
router.post('/:id/collaborators', validateParams(projectSchemas.idParam), validate(projectSchemas.addCollaborator), projectController.addCollaborator);
router.delete('/:id/collaborators/:userId', projectController.removeCollaborator);

export default router;
