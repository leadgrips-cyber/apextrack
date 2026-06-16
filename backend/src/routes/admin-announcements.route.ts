import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import {
  handleAdminListAnnouncements,
  handleAdminCreateAnnouncement,
  handleAdminUpdateAnnouncement,
  handleAdminDeleteAnnouncement,
} from '../controllers/announcements.controller.js';

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleAdminListAnnouncements);
router.post('/', handleAdminCreateAnnouncement);
router.patch('/:id', handleAdminUpdateAnnouncement);
router.delete('/:id', handleAdminDeleteAnnouncement);

export default router;
