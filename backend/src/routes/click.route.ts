import { Router } from 'express';
import { trackClick } from "../controllers/click.controller.js";

const router = Router();

router.get('/', trackClick);

export default router;
