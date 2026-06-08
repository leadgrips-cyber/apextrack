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

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/', handleListOffers);
router.get('/:id', handleGetOfferDetails);
router.post('/', handleCreateOffer);
router.put('/:id', handleUpdateOffer);
router.patch('/:id/pause', handlePauseOffer);
router.patch('/:id/activate', handleActivateOffer);
router.delete('/:id', handleDeleteOffer);

export default router;
