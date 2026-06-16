import * as repo from "../repositories/targeting.repository.js";
import type { TargetingRuleRecord, RuleType, Operator, Action } from "../repositories/targeting.repository.js";

export type { TargetingRuleRecord };

// ── User-agent parsing ────────────────────────────────────────────────────────

function parseOS(ua: string): string {
  const s = ua.toLowerCase();
  if (s.includes("iphone") || s.includes("ipad")) return "ios";
  if (s.includes("android")) return "android";
  if (s.includes("windows")) return "windows";
  if (s.includes("macintosh") || s.includes("mac os")) return "mac";
  if (s.includes("linux")) return "linux";
  return "";
}

function parseBrowser(ua: string): string {
  const s = ua.toLowerCase();
  if (s.includes("edg/") || s.includes("edge/")) return "edge";
  if (s.includes("opr/") || s.includes("opera")) return "opera";
  if (s.includes("firefox")) return "firefox";
  if (s.includes("chrome")) return "chrome";
  if (s.includes("safari")) return "safari";
  if (s.includes("trident/") || s.includes("msie")) return "ie";
  return "";
}

// ── Click context ─────────────────────────────────────────────────────────────

export interface ClickContext {
  countryCode: string | null;
  deviceType: string | null;
  userAgent: string;
}

function resolveValue(rule_type: string, ctx: ClickContext): string {
  switch (rule_type) {
    case "COUNTRY": return (ctx.countryCode ?? "").toUpperCase();
    case "DEVICE":  return (ctx.deviceType ?? "").toLowerCase();
    case "OS":      return parseOS(ctx.userAgent);
    case "BROWSER": return parseBrowser(ctx.userAgent);
    case "ISP":     return ""; // ISP detection requires GeoIP — not available at runtime
    default:        return "";
  }
}

function ruleConditionMet(rule: TargetingRuleRecord, ctx: ClickContext): boolean {
  // ALL_COUNTRIES is a wildcard: matches every country regardless of the actual value
  if (rule.rule_type === "COUNTRY" && rule.rule_value.trim().toUpperCase() === "ALL_COUNTRIES") {
    return true;
  }
  const actual = resolveValue(rule.rule_type, ctx);
  if (!actual) return false; // can't evaluate unknown value
  const expected = rule.rule_value.trim().toLowerCase();
  const actualLower = actual.toLowerCase();
  if (rule.operator === "IS")     return actualLower === expected;
  if (rule.operator === "IS_NOT") return actualLower !== expected;
  return false;
}

// ── Public engine function ────────────────────────────────────────────────────

export async function evaluateTargeting(
  offerId: number,
  ctx: ClickContext
): Promise<{ blocked: boolean; reason: string }> {
  const rules = await repo.listActiveRules(offerId);
  if (rules.length === 0) return { blocked: false, reason: "" };

  let blocked = false;
  let blockingRule: TargetingRuleRecord | null = null;

  for (const rule of rules) {
    if (!ruleConditionMet(rule, ctx)) continue;
    if (rule.action === "BLOCK") {
      blocked = true;
      blockingRule = rule;
    }
    if (rule.action === "ALLOW") {
      // ALLOW explicitly overrides any BLOCK — immediately permit
      return { blocked: false, reason: "" };
    }
  }

  if (blocked && blockingRule) {
    return {
      blocked: true,
      reason: `Targeting blocked: ${blockingRule.rule_type} ${blockingRule.operator} "${blockingRule.rule_value}"`,
    };
  }
  return { blocked: false, reason: "" };
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export async function listRules(offerId: number) {
  return repo.listRules(offerId);
}

export async function createRule(
  offerId: number,
  rule_type: string,
  operator: string,
  rule_value: string,
  action: string
) {
  const trimmed = rule_value?.trim();
  if (!trimmed) throw new Error("rule_value is required");
  repo.assertValid(rule_type, operator, action);
  return repo.insertRule(offerId, rule_type as RuleType, operator as Operator, trimmed, action as Action);
}

export async function toggleRule(ruleId: string, offerId: number, is_active: boolean) {
  const updated = await repo.updateRule(ruleId, offerId, { is_active });
  if (!updated) throw new Error("Rule not found");
  return updated;
}

export async function patchRule(
  ruleId: string,
  offerId: number,
  fields: { rule_value?: string; operator?: string; action?: string; is_active?: boolean }
) {
  if (fields.operator) repo.assertValid("COUNTRY", fields.operator, fields.action ?? "BLOCK");
  if (fields.action) repo.assertValid("COUNTRY", fields.operator ?? "IS", fields.action);
  const updated = await repo.updateRule(ruleId, offerId, {
    rule_value: fields.rule_value,
    operator: fields.operator as Operator | undefined,
    action: fields.action as Action | undefined,
    is_active: fields.is_active,
  });
  if (!updated) throw new Error("Rule not found");
  return updated;
}

export async function removeRule(ruleId: string, offerId: number) {
  const deleted = await repo.deleteRule(ruleId, offerId);
  if (!deleted) throw new Error("Rule not found");
}
