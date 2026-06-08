import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleCreatePublisherPostback,
  handleDeletePublisherPostback,
  handleGetPublisherPostback,
  handleListPublisherPostbacks,
  handleUpdatePublisherPostback,
} from "../controllers/publisher-postback.controller.js";

const router = Router();

router.use(authenticateJwt, authorizeRoles('publisher'));

router.post('/', handleCreatePublisherPostback);
router.get('/', handleListPublisherPostbacks);
router.get('/:id', handleGetPublisherPostback);
router.put('/:id', handleUpdatePublisherPostback);
router.delete('/:id', handleDeletePublisherPostback);

export default router;
