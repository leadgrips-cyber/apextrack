import { Router } from 'express';
import { authenticateJwt } from '../middlewares/auth.middleware.js';
import { authorizeRoles } from '../middlewares/rbac.middleware.js';
import {
  handleListPostbacks,
  handleCreatePostback,
  handleUpdatePostback,
  handleDeletePostback,
  handleTestPostback,
  handleAdvertiserLogs,
  handleAffiliateLogs,
} from '../controllers/admin-postback.controller.js';

const router = Router();

router.use(authenticateJwt, authorizeRoles('admin'));

router.get('/',           handleListPostbacks);
router.post('/',          handleCreatePostback);
router.patch('/:id',      handleUpdatePostback);
router.delete('/:id',     handleDeletePostback);

router.post('/test',      handleTestPostback);
router.get('/logs/advertiser', handleAdvertiserLogs);
router.get('/logs/affiliate',  handleAffiliateLogs);

export default router;
