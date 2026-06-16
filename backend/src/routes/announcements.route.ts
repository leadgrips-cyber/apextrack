import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import { handleListActiveAnnouncements } from '../controllers/announcements.controller.js';

const router = Router();

router.use(authenticateJwt, authorizeRoles('publisher'));
router.get('/', handleListActiveAnnouncements);

export default router;
