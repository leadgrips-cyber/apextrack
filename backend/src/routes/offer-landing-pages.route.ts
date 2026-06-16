import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import {
  handleListLandingPages,
  handleCreateLandingPage,
  handleUpdateLandingPage,
  handleDeleteLandingPage,
} from '../controllers/offer-landing-pages.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListLandingPages);
router.post('/', handleCreateLandingPage);
router.put('/:id', handleUpdateLandingPage);
router.delete('/:id', handleDeleteLandingPage);

export default router;
