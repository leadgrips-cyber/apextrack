import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validateTurnstile } from "../middlewares/turnstile.middleware.js";
import {
  handleAdvertiserSignup,
  handleAdvertiserLogin,
  handleGetAdvertiserCounts,
  handleListAdvertisers,
  handleGetAdvertiser,
  handleCreateAdvertiser,
  handleUpdateAdvertiser,
  handleActivateAdvertiser,
  handleDeactivateAdvertiser,
} from "../controllers/advertiser.controller.js";

const router = Router();

// ── Public routes (no auth) ───────────────────────────────────────────────────
router.post('/signup', validateTurnstile, handleAdvertiserSignup);
router.post('/login',  handleAdvertiserLogin);

// ── Admin-only routes ─────────────────────────────────────────────────────────
router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/counts',     handleGetAdvertiserCounts);
router.get('/',           handleListAdvertisers);
router.get('/:id',        handleGetAdvertiser);
router.post('/',          handleCreateAdvertiser);
router.put('/:id',        handleUpdateAdvertiser);
router.post('/:id/activate',   handleActivateAdvertiser);
router.post('/:id/deactivate', handleDeactivateAdvertiser);

export default router;
