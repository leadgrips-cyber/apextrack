import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleGetSmtp,
  handleUpdateSmtp,
  handleTestSmtp,
  handleSmtpStatus,
  handleListTemplates,
  handleGetTemplate,
  handleUpdateTemplate,
  handleBulkPreview,
  handleBulkSend,
  handleListLogs,
} from "../controllers/mailer.controller.js";

const router = Router();
const admin = [authenticateJwt, authorizeRoles('admin')];

// SMTP Settings
router.get('/smtp/status', handleSmtpStatus);      // admin-token-free status check
router.get('/smtp',        ...admin, handleGetSmtp);
router.put('/smtp',        ...admin, handleUpdateSmtp);
router.post('/smtp/test',  ...admin, handleTestSmtp);

// Email Templates
router.get('/templates',        ...admin, handleListTemplates);
router.get('/templates/:slug',  ...admin, handleGetTemplate);
router.put('/templates/:slug',  ...admin, handleUpdateTemplate);

// Bulk Mailer
router.get('/bulk/preview', ...admin, handleBulkPreview);
router.post('/bulk',        ...admin, handleBulkSend);

// Email Logs
router.get('/logs', ...admin, handleListLogs);

export default router;
