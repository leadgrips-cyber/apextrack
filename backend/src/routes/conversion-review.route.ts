import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleListConversions,
  handleApproveConversion,
  handleRejectConversion,
  handleUpdateStatus,
  handleGetHistory,
} from "../controllers/conversion-review.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListConversions);
router.post('/:id/approve', handleApproveConversion);
router.post('/:id/reject', handleRejectConversion);
router.put('/:id/status', handleUpdateStatus);
router.get('/:id/history', handleGetHistory);

export default router;
