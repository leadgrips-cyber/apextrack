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
  handleGetClickReport,
  handleGetConversionReport,
  handleGetDailyReport,
} from "../controllers/analytics.controller.js";
import {
  handleGetPayoutsSummary,
  handleGetPublishersWithBalances,
  handleGetWalletTransactions,
  handleProcessManualPayout,
} from "../controllers/payouts.controller.js";
import {
  handleGetInvoicesSummary,
  handleListInvoices,
  handleGetInvoice,
  handleCreateInvoice,
  handleMarkInvoicePaid,
  handleHoldInvoice,
  handleUnholdInvoice,
  handleUpdateInvoice,
  handleDeleteInvoice,
} from "../controllers/invoices.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/dashboard/summary', handleGetDashboardSummary);
router.get('/dashboard/chart-data', handleGetChartData);
router.get('/dashboard/top-publishers', handleGetTopPublishers);
router.get('/dashboard/top-offers', handleGetTopOffers);
router.get('/dashboard/recent-conversions', handleGetRecentConversions);
router.get('/dashboard/recent-postbacks', handleGetRecentPostbacks);

router.get('/reports/clicks', handleGetClickReport);
router.get('/reports/conversions', handleGetConversionReport);
router.get('/reports/daily', handleGetDailyReport);

router.get('/finance/revenue-by-offer', handleGetRevenueByOffer);
router.get('/finance/transactions', handleGetRevenueTransactions);

router.get('/finance/payouts/summary', handleGetPayoutsSummary);
router.get('/finance/payouts/publishers', handleGetPublishersWithBalances);
router.get('/finance/payouts/transactions', handleGetWalletTransactions);
router.post('/finance/payouts/process', handleProcessManualPayout);

router.get('/finance/invoices/summary',    handleGetInvoicesSummary);
router.get('/finance/invoices',            handleListInvoices);
router.get('/finance/invoices/:id',        handleGetInvoice);
router.post('/finance/invoices',           handleCreateInvoice);
router.post('/finance/invoices/:id/pay',   handleMarkInvoicePaid);
router.post('/finance/invoices/:id/hold',   handleHoldInvoice);
router.post('/finance/invoices/:id/unhold', handleUnholdInvoice);
router.put('/finance/invoices/:id',         handleUpdateInvoice);
router.delete('/finance/invoices/:id',      handleDeleteInvoice);

export default router;
