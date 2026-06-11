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
  handleGetRevenueByOffer,
  handleGetRevenueTransactions,
} from "../controllers/analytics.controller.js";
import {
  handleGetPayoutsSummary,
  handleGetPublishersWithBalances,
  handleGetWalletTransactions,
  handleProcessManualPayout,
} from "../controllers/payouts.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/dashboard/summary', handleGetDashboardSummary);
router.get('/dashboard/chart-data', handleGetChartData);
router.get('/dashboard/top-publishers', handleGetTopPublishers);
router.get('/dashboard/top-offers', handleGetTopOffers);
router.get('/dashboard/recent-conversions', handleGetRecentConversions);
router.get('/dashboard/recent-postbacks', handleGetRecentPostbacks);

router.get('/finance/revenue-by-offer', handleGetRevenueByOffer);
router.get('/finance/transactions', handleGetRevenueTransactions);

router.get('/finance/payouts/summary', handleGetPayoutsSummary);
router.get('/finance/payouts/publishers', handleGetPublishersWithBalances);
router.get('/finance/payouts/transactions', handleGetWalletTransactions);
router.post('/finance/payouts/process', handleProcessManualPayout);

export default router;
