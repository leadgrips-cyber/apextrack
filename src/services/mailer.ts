const API_URL = "/api";

function adminHeaders() {
  const token = localStorage.getItem("admin_token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, init);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || `Request failed: ${res.status}`);
  return data as T;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface SmtpSettings {
  id: number;
  host: string;
  port: number;
  username: string;
  /** Always returned as '••••••••' if set, or '' if not set. Send a new value to change. */
  password: string;
  password_is_set?: boolean;
  from_name: string;
  from_email: string;
  reply_to: string;
  secure: boolean;
  is_enabled: boolean;
  updated_at: string;
}

export interface EmailTemplate {
  id: number;
  slug: string;
  name: string;
  subject: string;
  body_html: string;
  is_active: boolean;
  updated_at: string;
}

export interface EmailLog {
  id: number;
  recipient: string;
  template_slug: string | null;
  subject: string | null;
  status: 'sent' | 'failed' | 'pending';
  error: string | null;
  sent_at: string;
}

export interface BulkMailPayload {
  recipient_type: 'publisher' | 'advertiser' | 'manager';
  template_slug?: string;
  subject: string;
  body_html: string;
  extra_variables?: Record<string, string>;
  filters?: { status?: string; country?: string };
}

// ─── SMTP ──────────────────────────────────────────────────────────────────────

export async function getSmtpStatus(): Promise<boolean> {
  try {
    const data = await apiFetch<{ configured: boolean }>('/mailer/smtp/status', {});
    return data.configured;
  } catch {
    return false;
  }
}

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const data = await apiFetch<{ settings: SmtpSettings }>('/mailer/smtp', {
    headers: adminHeaders(),
  });
  return data.settings;
}

export async function updateSmtpSettings(payload: Partial<SmtpSettings>): Promise<SmtpSettings> {
  const data = await apiFetch<{ settings: SmtpSettings }>('/mailer/smtp', {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  return data.settings;
}

export async function sendTestEmail(to: string): Promise<{ success: boolean; message: string }> {
  return apiFetch<{ success: boolean; message: string }>('/mailer/smtp/test', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ to }),
  });
}

// ─── Templates ─────────────────────────────────────────────────────────────────

export async function listEmailTemplates(): Promise<EmailTemplate[]> {
  const data = await apiFetch<{ templates: EmailTemplate[] }>('/mailer/templates', {
    headers: adminHeaders(),
  });
  return data.templates;
}

export async function getEmailTemplate(slug: string): Promise<EmailTemplate> {
  const data = await apiFetch<{ template: EmailTemplate }>(`/mailer/templates/${slug}`, {
    headers: adminHeaders(),
  });
  return data.template;
}

export async function updateEmailTemplate(
  slug: string,
  payload: { subject?: string; body_html?: string; is_active?: boolean }
): Promise<EmailTemplate> {
  const data = await apiFetch<{ template: EmailTemplate }>(`/mailer/templates/${slug}`, {
    method: 'PUT',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
  return data.template;
}

// ─── Bulk ──────────────────────────────────────────────────────────────────────

export async function previewBulkCount(
  recipientType: string,
  filters?: { status?: string; country?: string }
): Promise<number> {
  const params = new URLSearchParams({ recipient_type: recipientType });
  if (filters?.status)  params.set('status',  filters.status);
  if (filters?.country) params.set('country', filters.country);
  const data = await apiFetch<{ count: number }>(`/mailer/bulk/preview?${params}`, {
    headers: adminHeaders(),
  });
  return data.count;
}

export async function sendBulkMail(
  payload: BulkMailPayload
): Promise<{ sent: number; failed: number; total: number }> {
  return apiFetch<{ sent: number; failed: number; total: number }>('/mailer/bulk', {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify(payload),
  });
}

// ─── Logs ──────────────────────────────────────────────────────────────────────

export async function getEmailLogs(params?: {
  status?: string;
  recipient?: string;
  page?: number;
  limit?: number;
}): Promise<{ logs: EmailLog[]; total: number; page: number; limit: number }> {
  const qs = new URLSearchParams();
  if (params?.status)    qs.set('status',    params.status);
  if (params?.recipient) qs.set('recipient', params.recipient);
  if (params?.page)      qs.set('page',      String(params.page));
  if (params?.limit)     qs.set('limit',     String(params.limit));
  return apiFetch(`/mailer/logs?${qs}`, { headers: adminHeaders() });
}
