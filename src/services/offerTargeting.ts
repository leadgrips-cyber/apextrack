const API_URL = "/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

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

async function request<T>(url: string, init: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function listRules(offerId: number): Promise<TargetingRuleRecord[]> {
  const d = await request<{ rules: TargetingRuleRecord[] }>(
    `${API_URL}/offers/${offerId}/targeting`,
    { headers: authHeaders() }
  );
  return d.rules;
}

export async function createRule(
  offerId: number,
  rule_type: RuleType,
  operator: Operator,
  rule_value: string,
  action: Action
): Promise<TargetingRuleRecord> {
  const d = await request<{ rule: TargetingRuleRecord }>(
    `${API_URL}/offers/${offerId}/targeting`,
    {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ rule_type, operator, rule_value, action }),
    }
  );
  return d.rule;
}

export async function updateRule(
  offerId: number,
  ruleId: string,
  fields: Partial<{ rule_value: string; operator: Operator; action: Action; is_active: boolean }>
): Promise<TargetingRuleRecord> {
  const d = await request<{ rule: TargetingRuleRecord }>(
    `${API_URL}/offers/${offerId}/targeting/${ruleId}`,
    {
      method: "PUT",
      headers: authHeaders(),
      body: JSON.stringify(fields),
    }
  );
  return d.rule;
}

export async function deleteRule(offerId: number, ruleId: string): Promise<void> {
  await fetch(`${API_URL}/offers/${offerId}/targeting/${ruleId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
}
