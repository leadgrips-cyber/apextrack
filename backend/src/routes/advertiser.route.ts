import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleListAdvertisers,
  handleGetAdvertiser,
  handleCreateAdvertiser,
  handleUpdateAdvertiser,
} from "../controllers/advertiser.controller.js";

const router = Router();

// All advertiser endpoints are admin-only — publishers must never access this route.
router.use(authenticateJwt);
router.use(authorizeRoles('admin'));

router.get('/', handleListAdvertisers);
router.get('/:id', handleGetAdvertiser);
router.post('/', handleCreateAdvertiser);
router.put('/:id', handleUpdateAdvertiser);

export default router;
