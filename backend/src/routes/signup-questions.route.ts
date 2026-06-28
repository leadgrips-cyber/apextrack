import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleListPublic,
  handleListAll,
  handleCreate,
  handleUpdate,
  handleDelete,
  handleSubmitResponses,
  handleGetResponsesByPublisher,
} from "../controllers/signup-questions.controller.js";

const router = Router();

// Public — no auth required
router.get('/public', handleListPublic);
router.post('/responses', handleSubmitResponses);

// Admin-only
router.get('/publisher/:publisherId', authenticateJwt, authorizeRoles('admin'), handleGetResponsesByPublisher);
router.get('/',    authenticateJwt, authorizeRoles('admin'), handleListAll);
router.post('/',   authenticateJwt, authorizeRoles('admin'), handleCreate);
router.put('/:id', authenticateJwt, authorizeRoles('admin'), handleUpdate);
router.delete('/:id', authenticateJwt, authorizeRoles('admin'), handleDelete);

export default router;
