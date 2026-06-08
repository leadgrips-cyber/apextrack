import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleGenerateTrackingLink,
  handleGetTrackingLinkDetails,
  handleListTrackingLinks,
} from "../controllers/tracking.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('publisher'));

router.post('/', handleGenerateTrackingLink);
router.get('/', handleListTrackingLinks);
router.get('/:id', handleGetTrackingLinkDetails);

export default router;
