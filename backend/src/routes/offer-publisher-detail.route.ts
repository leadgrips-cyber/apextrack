import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { handleGetPublisherDetail } from '../controllers/offer-publisher-detail.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticateJwt);
router.get('/', handleGetPublisherDetail);

export default router;
