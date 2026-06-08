import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleGetDashboardSummary,
  handleGetChartData,
  handleGetTopPublishers,
  handleGetTopOffers,
  handleGetRecentConversions,
  handleGetRecentPostbacks,
} from "../controllers/analytics.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/dashboard/summary', handleGetDashboardSummary);
router.get('/dashboard/chart-data', handleGetChartData);
router.get('/dashboard/top-publishers', handleGetTopPublishers);
router.get('/dashboard/top-offers', handleGetTopOffers);
router.get('/dashboard/recent-conversions', handleGetRecentConversions);
router.get('/dashboard/recent-postbacks', handleGetRecentPostbacks);

export default router;
