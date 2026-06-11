import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleGetSettings,
  handleUpdateSettings,
  handleGetPublicSettings,
} from "../controllers/network-settings.controller.js";

const router = Router();

// Public — no auth required (returns only safe branding fields)
router.get('/public', handleGetPublicSettings);

// Admin-only — full settings read/write
router.get('/', authenticateJwt, authorizeRoles('admin'), handleGetSettings);
router.put('/', authenticateJwt, authorizeRoles('admin'), handleUpdateSettings);

export default router;
