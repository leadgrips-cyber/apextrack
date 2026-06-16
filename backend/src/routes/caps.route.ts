import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { handleGetCaps, handleSaveCaps } from "../controllers/caps.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticateJwt, authorizeRoles("admin"));

router.get("/",  handleGetCaps);
router.put("/",  handleSaveCaps);
router.post("/", handleSaveCaps);

export default router;
