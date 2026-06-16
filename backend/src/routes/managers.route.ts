import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleListManagers,
  handleCreateManager,
  handleUpdateManager,
  handleDeleteManager,
  handleGetManagerStats,
  handleGetManagerPublishers,
  handleGetManagerApplications,
} from "../controllers/managers.controller.js";

const router = Router();
router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListManagers);
router.post('/', handleCreateManager);
router.get('/:id/stats', handleGetManagerStats);
router.get('/:id/publishers', handleGetManagerPublishers);
router.get('/:id/applications', handleGetManagerApplications);
router.put('/:id', handleUpdateManager);
router.delete('/:id', handleDeleteManager);

export default router;
