import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import {
  handleListCreatives,
  handleCreateCreative,
  handleUpdateCreative,
  handleDeleteCreative,
} from '../controllers/offer-creatives.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListCreatives);
router.post('/', handleCreateCreative);
router.put('/:id', handleUpdateCreative);
router.delete('/:id', handleDeleteCreative);

export default router;
