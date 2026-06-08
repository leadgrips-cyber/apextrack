import { Router } from 'express';
import { login, logout, me, register, updateProfile } from "../controllers/auth.controller.js";
import { authenticateJwt } from "../middlewares/auth.middleware.js";

const router = Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', authenticateJwt, logout);
router.get('/me', authenticateJwt, me);
router.put('/me', authenticateJwt, updateProfile);

export default router;
