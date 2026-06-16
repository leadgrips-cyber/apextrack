import { Router } from "express";
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import {
  handleListRules,
  handleCreateRule,
  handleUpdateRule,
  handleDeleteRule,
} from "../controllers/targeting.controller.js";

const router = Router({ mergeParams: true });

router.use(authenticateJwt, authorizeRoles("admin"));

router.get("/",           handleListRules);
router.post("/",          handleCreateRule);
router.put("/:ruleId",    handleUpdateRule);
router.delete("/:ruleId", handleDeleteRule);

export default router;
