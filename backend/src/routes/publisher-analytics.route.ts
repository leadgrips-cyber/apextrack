import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleGetDashboardStats,
  handleGetClickReport,
  handleGetConversionReport,
  handleGetDailyReport,
  handleGetOverviewReport,
  handleGetWalletBalance,
  handleGetWalletTransactions,
} from "../controllers/publisher-analytics.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('publisher'));

router.get('/dashboard', handleGetDashboardStats);
router.get('/clicks', handleGetClickReport);
router.get('/conversions', handleGetConversionReport);
router.get('/reports/daily', handleGetDailyReport);
router.get('/reports/overview', handleGetOverviewReport);
router.get('/wallet', handleGetWalletBalance);
router.get('/wallet/transactions', handleGetWalletTransactions);

export default router;
