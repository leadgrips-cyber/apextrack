import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleApplyForOffer,
  handleApproveApplication,
  handleGetApplicationDetails,
  handleListApplications,
  handleListPublisherApplications,
  handleRejectApplication,
} from "../controllers/application.controller.js";

const router = Router();

router.post('/', authenticateJwt, authorizeRoles('publisher'), handleApplyForOffer);
router.get('/me', authenticateJwt, authorizeRoles('publisher'), handleListPublisherApplications);
router.get('/:id', authenticateJwt, authorizeRoles('admin'), handleGetApplicationDetails);
router.get('/', authenticateJwt, authorizeRoles('admin'), handleListApplications);
router.patch('/:id/approve', authenticateJwt, authorizeRoles('admin'), handleApproveApplication);
router.patch('/:id/reject', authenticateJwt, authorizeRoles('admin'), handleRejectApplication);

export default router;
