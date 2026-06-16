import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import {
  handleListPublishersWithAssignment,
  handleAssignPublisher,
  handleUnassignPublisher,
  handleBulkAssign,
  handleBulkUnassign,
} from '../controllers/offer-assignments.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListPublishersWithAssignment);
router.post('/', handleAssignPublisher);
router.post('/bulk-assign', handleBulkAssign);
router.post('/bulk-unassign', handleBulkUnassign);
router.delete('/:publisherId', handleUnassignPublisher);

export default router;
