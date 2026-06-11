import { Router } from 'express';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleActivateOffer,
  handleCreateOffer,
  handleDeleteOffer,
  handleGetOfferDetails,
  handleListOffers,
  handlePauseOffer,
  handleUpdateOffer,
} from "../controllers/offer.controller.js";

const router = Router();

router.use(authenticateJwt);

// Publisher + Admin
router.get('/', handleListOffers);
router.get('/:id', handleGetOfferDetails);

// Admin only
router.post('/', authorizeRoles('admin'), handleCreateOffer);
router.put('/:id', authorizeRoles('admin'), handleUpdateOffer);
router.patch('/:id/pause', authorizeRoles('admin'), handlePauseOffer);
router.patch('/:id/activate', authorizeRoles('admin'), handleActivateOffer);
router.delete('/:id', authorizeRoles('admin'), handleDeleteOffer);

export default router;
