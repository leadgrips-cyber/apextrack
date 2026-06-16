import { query } from "../db/index.js";

export type RuleType = "COUNTRY" | "OS" | "DEVICE" | "BROWSER" | "ISP";
export type Operator = "IS" | "IS_NOT";
export type Action   = "ALLOW" | "BLOCK";

export interface TargetingRuleRecord {
  id: string;
  offer_id: number;
  rule_type: RuleType;
  operator: Operator;
  rule_value: string;
  action: Action;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const VALID_RULE_TYPES: RuleType[]  = ["COUNTRY", "OS", "DEVICE", "BROWSER", "ISP"];
const VALID_OPERATORS:  Operator[]  = ["IS", "IS_NOT"];
const VALID_ACTIONS:    Action[]    = ["ALLOW", "BLOCK"];

export function assertValid(rule_type: string, operator: string, action: string) {
  if (!VALID_RULE_TYPES.includes(rule_type as RuleType))
    throw new Error(`Invalid rule_type: ${rule_type}`);
  if (!VALID_OPERATORS.includes(operator as Operator))
    throw new Error(`Invalid operator: ${operator}`);
  if (!VALID_ACTIONS.includes(action as Action))
    throw new Error(`Invalid action: ${action}`);
}

export async function listRules(offerId: number): Promise<TargetingRuleRecord[]> {
  const result = await query<TargetingRuleRecord>(
    `SELECT * FROM offer_targeting_rules WHERE offer_id = $1 ORDER BY created_at ASC`,
    [offerId]
  );
  return result.rows;
}

export async function listActiveRules(offerId: number): Promise<TargetingRuleRecord[]> {
  const result = await query<TargetingRuleRecord>(
    `SELECT * FROM offer_targeting_rules WHERE offer_id = $1 AND is_active = TRUE`,
    [offerId]
  );
  return result.rows;
}

export async function insertRule(
  offerId: number,
  rule_type: RuleType,
  operator: Operator,
  rule_value: string,
  action: Action
): Promise<TargetingRuleRecord> {
  const result = await query<TargetingRuleRecord>(
    `INSERT INTO offer_targeting_rules
       (offer_id, rule_type, operator, rule_value, action, is_active, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, TRUE, NOW(), NOW())
     RETURNING *`,
    [offerId, rule_type, operator, rule_value.trim(), action]
  );
  return result.rows[0];
}

export async function updateRule(
  ruleId: string,
  offerId: number,
  fields: { is_active?: boolean; rule_value?: string; operator?: Operator; action?: Action }
): Promise<TargetingRuleRecord | null> {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (fields.is_active !== undefined) {
    values.push(fields.is_active);
    setClauses.push(`is_active = $${values.length}`);
  }
  if (fields.rule_value !== undefined) {
    values.push(fields.rule_value.trim());
    setClauses.push(`rule_value = $${values.length}`);
  }
  if (fields.operator !== undefined) {
    values.push(fields.operator);
    setClauses.push(`operator = $${values.length}`);
  }
  if (fields.action !== undefined) {
    values.push(fields.action);
    setClauses.push(`action = $${values.length}`);
  }

  if (setClauses.length === 0) {
    const r = await query<TargetingRuleRecord>(
      `SELECT * FROM offer_targeting_rules WHERE id = $1 AND offer_id = $2 LIMIT 1`,
      [ruleId, offerId]
    );
    return r.rows[0] ?? null;
  }

  values.push(ruleId, offerId);
  const result = await query<TargetingRuleRecord>(
    `UPDATE offer_targeting_rules
     SET ${setClauses.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length - 1} AND offer_id = $${values.length}
     RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteRule(ruleId: string, offerId: number): Promise<boolean> {
  const result = await query(
    `DELETE FROM offer_targeting_rules WHERE id = $1 AND offer_id = $2`,
    [ruleId, offerId]
  );
  return (result.rowCount ?? 0) > 0;
}
