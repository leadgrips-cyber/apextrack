import { Router } from 'express';
import { authenticatePublisherApiKey } from "../middlewares/publisher-api-key.middleware.js";
import {
  handleWhoAmI,
  handleListOffers,
  handleListApprovedOffers,
  handleGetOffer,
  handleGetOfferCreatives,
  handleGetOfferLandingPages,
  handleGetOfferTargeting,
  handleListCategories,
  handleListTrackingLinks,
  handleCreateTrackingLink,
  handleGetTrackingLink,
  handleClickReport,
  handleConversionReport,
  handleDailyReport,
  handleEventReport,
  handleSummaryReport,
} from "../controllers/publisher-api.controller.js";

// External, API-key-authenticated Publisher API (v1).
// Every route here requires a valid `pub_...` key — see
// backend/src/middlewares/publisher-api-key.middleware.ts. This router is
// entirely additive: it does not alter the existing JWT-based dashboard
// routes mounted elsewhere in routes/index.ts.
const router = Router();
router.use(authenticatePublisherApiKey);

router.get('/me', handleWhoAmI);

router.get('/offers', handleListOffers);
router.get('/offers/approved', handleListApprovedOffers);
router.get('/offers/:id', handleGetOffer);
router.get('/offers/:id/creatives', handleGetOfferCreatives);
router.get('/offers/:id/landing-pages', handleGetOfferLandingPages);
router.get('/offers/:id/targeting', handleGetOfferTargeting);

router.get('/categories', handleListCategories);

router.get('/tracking-links', handleListTrackingLinks);
router.post('/tracking-links', handleCreateTrackingLink);
router.get('/tracking-links/:id', handleGetTrackingLink);

router.get('/reports/clicks', handleClickReport);
router.get('/reports/conversions', handleConversionReport);
router.get('/reports/daily', handleDailyReport);
router.get('/reports/events', handleEventReport);
router.get('/reports/summary', handleSummaryReport);

export default router;
