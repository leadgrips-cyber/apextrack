import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import {
  handleVerifyEmail,
  handleResendVerification,
  handleGetVerificationStats,
} from '../controllers/verification.controller.js';

const router = Router();

router.post('/verify',  handleVerifyEmail);
router.post('/resend',  handleResendVerification);
router.get('/stats',    authenticateJwt, authorizeRoles('admin'), handleGetVerificationStats);

export default router;
