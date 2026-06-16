import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import {
  handleListNotifications,
  handleGetUnreadCount,
  handleMarkAsRead,
  handleMarkAllAsRead,
} from '../controllers/notifications.controller.js';

const router = Router();

router.use(authenticateJwt, authorizeRoles('publisher'));

router.get('/', handleListNotifications);
router.get('/unread-count', handleGetUnreadCount);
router.patch('/read-all', handleMarkAllAsRead);
router.patch('/:id/read', handleMarkAsRead);

export default router;
