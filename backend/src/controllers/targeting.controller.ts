import { Request, Response, NextFunction } from "express";
import * as svc from "../services/targeting.service.js";

function offerId(req: Request): number {
  return Number(req.params.offerId);
}

export async function handleListRules(req: Request, res: Response, next: NextFunction) {
  try {
    const rules = await svc.listRules(offerId(req));
    res.json({ rules });
  } catch (err) { next(err); }
}

export async function handleCreateRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { rule_type, operator, rule_value, action } = req.body as {
      rule_type?: string; operator?: string; rule_value?: string; action?: string;
    };
    if (!rule_type || !operator || !rule_value || !action) {
      res.status(400).json({ message: "rule_type, operator, rule_value, action are required" });
      return;
    }
    const rule = await svc.createRule(offerId(req), rule_type, operator, rule_value, action);
    res.status(201).json({ rule });
  } catch (err: any) {
    if (err.code === "23505") {
      res.status(409).json({ message: "Duplicate rule: same offer/type/operator/value already exists" });
      return;
    }
    if (err.message?.includes("Invalid")) {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function handleUpdateRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { ruleId } = req.params;
    const fields = req.body as { rule_value?: string; operator?: string; action?: string; is_active?: boolean };
    const rule = await svc.patchRule(ruleId, offerId(req), fields);
    res.json({ rule });
  } catch (err: any) {
    if (err.message === "Rule not found") {
      res.status(404).json({ message: "Rule not found" });
      return;
    }
    if (err.message?.includes("Invalid")) {
      res.status(400).json({ message: err.message });
      return;
    }
    next(err);
  }
}

export async function handleDeleteRule(req: Request, res: Response, next: NextFunction) {
  try {
    const { ruleId } = req.params;
    await svc.removeRule(ruleId, offerId(req));
    res.status(204).end();
  } catch (err: any) {
    if (err.message === "Rule not found") {
      res.status(404).json({ message: "Rule not found" });
      return;
    }
    next(err);
  }
}
