import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleListEvents,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
} from "../controllers/offer-events.controller.js";

// mergeParams: true so that :offerId from the parent router is visible here
const router = Router({ mergeParams: true });

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/',     handleListEvents);
router.post('/',    handleCreateEvent);
router.put('/:id',  handleUpdateEvent);
router.delete('/:id', handleDeleteEvent);

export default router;
