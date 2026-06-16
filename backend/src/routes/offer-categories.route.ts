import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleListCategories,
  handleCreateCategory,
  handleUpdateCategory,
  handleDeleteCategory,
} from "../controllers/offer-categories.controller.js";

const router = Router();

// GET is open to any authenticated user (publishers need category list for filtering)
router.get("/", authenticateJwt, handleListCategories);

// Write operations are admin-only
router.post("/", authenticateJwt, authorizeRoles("admin"), handleCreateCategory);
router.put("/:id", authenticateJwt, authorizeRoles("admin"), handleUpdateCategory);
router.delete("/:id", authenticateJwt, authorizeRoles("admin"), handleDeleteCategory);

export default router;
