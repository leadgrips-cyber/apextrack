import { Router } from 'express';
import { login, logout, me, register, updateProfile, forgotPassword, doResetPassword } from "../controllers/auth.controller.js";
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { validateTurnstile } from "../middlewares/turnstile.middleware.js";

const router = Router();

router.post('/login',          login);
router.post('/register',       validateTurnstile, register);
router.post('/logout',         authenticateJwt, logout);
router.get('/me',              authenticateJwt, me);
router.put('/me',              authenticateJwt, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password',  doResetPassword);

export default router;
