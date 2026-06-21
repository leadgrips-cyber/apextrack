import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleAdminCreatePublisher,
  handleAdminResendVerification,
  handleApprovePublisher,
  handleAssignManager,
  handleBlockPublisher,
  handleBulkAssign,
  handleGetPublisherDetails,
  handleGetPublisherWallet,
  handleListManagers,
  handleListPublisherApplications,
  handleListPublisherTrackingLinks,
  handleListPublishers,
  handleReactivatePublisher,
  handleRejectPublisher,
  handleSuspendPublisher,
  handleUpdatePublisherProfile,
} from "../controllers/publisher.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListPublishers);
router.post('/', handleAdminCreatePublisher);

// Static sub-paths must come before /:id to avoid param collision
router.get('/managers', handleListManagers);
router.patch('/bulk-assign', handleBulkAssign);

router.get('/:id', handleGetPublisherDetails);
router.patch('/:id/approve', handleApprovePublisher);
router.patch('/:id/reject', handleRejectPublisher);
router.patch('/:id/suspend', handleSuspendPublisher);
router.patch('/:id/reactivate', handleReactivatePublisher);
router.patch('/:id/block', handleBlockPublisher);
router.patch('/:id/assign-manager', handleAssignManager);
router.get('/:id/wallet', handleGetPublisherWallet);
router.patch('/:id/profile', handleUpdatePublisherProfile);
router.get('/:id/applications', handleListPublisherApplications);
router.get('/:id/tracking-links', handleListPublisherTrackingLinks);
router.post('/:id/resend-verification', handleAdminResendVerification);

export default router;
