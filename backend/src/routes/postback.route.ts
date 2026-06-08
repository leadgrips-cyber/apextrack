import { Router } from 'express';
import { getPostback, postPostback } from "../controllers/postback.controller.js";

const router = Router();

router.get('/', getPostback);
router.post('/', postPostback);

export default router;
