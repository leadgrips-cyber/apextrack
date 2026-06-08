import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleApprovePublisher,
  handleBlockPublisher,
  handleGetPublisherDetails,
  handleGetPublisherWallet,
  handleListPublisherApplications,
  handleListPublisherTrackingLinks,
  handleListPublishers,
  handleReactivatePublisher,
  handleSuspendPublisher,
} from "../controllers/publisher.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListPublishers);
router.get('/:id', handleGetPublisherDetails);
router.patch('/:id/approve', handleApprovePublisher);
router.patch('/:id/suspend', handleSuspendPublisher);
router.patch('/:id/reactivate', handleReactivatePublisher);
router.patch('/:id/block', handleBlockPublisher);
router.get('/:id/wallet', handleGetPublisherWallet);
router.get('/:id/applications', handleListPublisherApplications);
router.get('/:id/tracking-links', handleListPublisherTrackingLinks);

export default router;
