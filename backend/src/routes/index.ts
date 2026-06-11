import { Router } from 'express';
import authRouter from "./auth.route.js";
import clickRouter from "./click.route.js";
import postbackRouter from "./postback.route.js";
import offerRouter from "./offer.route.js";
import applicationRouter from "./application.route.js";
import trackingRouter from "./tracking.route.js";
import publisherPostbackRouter from "./publisher-postback.route.js";
import publisherRouter from "./publisher.route.js";
import analyticsRouter from "./analytics.route.js";
import advertiserRouter from "./advertiser.route.js";
import networkSettingsRouter from "./network-settings.route.js";

const router = Router();

router.use('/auth', authRouter);
router.use('/click', clickRouter);
router.use('/postback', postbackRouter);
router.use('/offers', offerRouter);
router.use('/applications', applicationRouter);
router.use('/tracking', trackingRouter);
router.use('/publisher-postbacks', publisherPostbackRouter);
router.use('/publishers', publisherRouter);
router.use('/analytics', analyticsRouter);
router.use('/advertisers', advertiserRouter);
router.use('/network-settings', networkSettingsRouter);

export default router;
