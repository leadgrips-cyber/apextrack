import nodemailer from "nodemailer";
import { query } from "../db/index.js";
import { getSmtpSettings } from "../repositories/smtp-settings.repository.js";
import { getTemplateBySlug, listTemplates } from "../repositories/email-templates.repository.js";
import { insertEmailLog } from "../repositories/email-logs.repository.js";
import { BulkMailPayload, MailVariables } from "../types/mailer.js";

// ─── Safety cap: prevents indefinite HTTP blocking on large bulk sends ─────────
const BULK_SEND_CAP = 500;

// ─── Variable rendering ────────────────────────────────────────────────────────

export function renderVariables(template: string, vars: MailVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
}

// ─── Network variables (auto-populated in every email) ────────────────────────

async function getNetworkVars(): Promise<{ network_name: string; login_url: string }> {
  const result = await query<{
    network_name: string;
    login_domain: string | null;
    tracking_domain: string;
  }>(`SELECT network_name, login_domain, tracking_domain FROM network_settings WHERE id = 1 LIMIT 1`);
  const row = result.rows[0];
  const rawUrl = row?.login_domain ?? row?.tracking_domain ?? '';
  return {
    network_name: row?.network_name ?? 'Network',
    login_url:    rawUrl.replace(/\/+$/, ''),
  };
}

// ─── Nodemailer transport factory ─────────────────────────────────────────────

function createTransport(settings: {
  host: string; port: number; secure: boolean;
  username: string; password: string;
}) {
  return nodemailer.createTransport({
    host:   settings.host,
    port:   settings.port,
    secure: settings.secure,
    auth:   settings.username
      ? { user: settings.username, pass: settings.password }
      : undefined,
    tls: { rejectUnauthorized: false },
  } as nodemailer.TransportOptions);
}

// ─── Core send ─────────────────────────────────────────────────────────────────

export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
  templateSlug?: string;
}): Promise<void> {
  const settings = await getSmtpSettings();

  if (!settings.is_enabled || !settings.host.trim()) {
    await insertEmailLog(
      options.to, options.subject, options.templateSlug ?? null,
      'failed', 'SMTP not configured or disabled'
    );
    throw new Error('SMTP not configured or disabled');
  }

  const transporter = createTransport(settings);

  try {
    await transporter.sendMail({
      from:    `"${settings.from_name}" <${settings.from_email}>`,
      replyTo: settings.reply_to || undefined,
      to:      options.to,
      subject: options.subject,
      html:    options.html,
    });
    await insertEmailLog(options.to, options.subject, options.templateSlug ?? null, 'sent', null);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await insertEmailLog(options.to, options.subject, options.templateSlug ?? null, 'failed', msg);
    throw err;
  }
}

// ─── Template-based send ──────────────────────────────────────────────────────
// Automatically injects network_name and login_url from network_settings

export async function sendTemplateEmail(
  to: string,
  slug: string,
  vars: MailVariables
): Promise<void> {
  const [tpl, netVars] = await Promise.all([
    getTemplateBySlug(slug),
    getNetworkVars(),
  ]);

  if (!tpl) {
    await insertEmailLog(to, null, slug, 'failed', `Template not found: ${slug}`);
    throw new Error(`Template not found: ${slug}`);
  }
  if (!tpl.is_active) {
    await insertEmailLog(to, tpl.subject || null, slug, 'failed', `Template is disabled: ${slug}`);
    throw new Error(`Template is disabled: ${slug}`);
  }

  const merged: MailVariables = {
    network_name: netVars.network_name,
    login_url:    netVars.login_url,
    ...vars, // caller-supplied vars override network defaults
  };

  const subject = renderVariables(tpl.subject, merged);
  const html    = renderVariables(tpl.body_html, merged);

  await sendMail({ to, subject, html, templateSlug: slug });
}

// ─── Test send ────────────────────────────────────────────────────────────────
// Does NOT check is_enabled so admins can verify credentials even while disabled.
// Logs both success and failure.

export async function sendTestEmail(to: string): Promise<void> {
  const settings = await getSmtpSettings();
  const subject  = 'Test Email — SMTP Configuration Verified';
  const html     = '<div style="font-family:sans-serif;padding:24px"><h2 style="color:#0891b2">SMTP Test Successful</h2><p>Your SMTP configuration is working correctly. This is a test email sent from your mailer settings.</p></div>';

  if (!settings.host.trim()) {
    await insertEmailLog(to, subject, 'test', 'failed', 'SMTP host is not configured');
    throw new Error('SMTP host is not configured');
  }

  const transporter = createTransport(settings);

  try {
    await transporter.verify();
    await transporter.sendMail({
      from:    `"${settings.from_name}" <${settings.from_email}>`,
      replyTo: settings.reply_to || undefined,
      to,
      subject,
      html,
    });
    await insertEmailLog(to, subject, 'test', 'sent', null);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    await insertEmailLog(to, subject, 'test', 'failed', msg);
    throw err;
  }
}

// ─── Recipient query helpers ──────────────────────────────────────────────────

interface Recipient {
  email:      string;
  first_name: string;
  last_name:  string;
}

async function getPublisherRecipients(filters: { status?: string; country?: string }): Promise<Recipient[]> {
  const conditions: string[] = [];
  const values: unknown[]    = [];
  let idx = 1;

  if (filters.status)  { conditions.push(`account_status = $${idx++}`); values.push(filters.status.toUpperCase()); }
  if (filters.country) { conditions.push(`country_code ILIKE $${idx++}`); values.push(`%${filters.country}%`); }

  const where  = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query<{ email: string; full_name: string }>(
    `SELECT email, full_name FROM publishers ${where} ORDER BY created_at DESC`, values
  );

  return result.rows.map((r) => {
    const parts = (r.full_name ?? '').split(' ');
    return { email: r.email, first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') };
  });
}

async function getAdvertiserRecipients(filters: { status?: string; country?: string }): Promise<Recipient[]> {
  const conditions: string[] = [];
  const values: unknown[]    = [];
  let idx = 1;

  if (filters.status)  { conditions.push(`status = $${idx++}`); values.push(filters.status.toUpperCase()); }
  if (filters.country) { conditions.push(`country ILIKE $${idx++}`); values.push(`%${filters.country}%`); }

  const where  = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query<{ email: string; contact_name: string }>(
    `SELECT email, contact_name FROM advertisers ${where} ORDER BY created_at DESC`, values
  );

  return result.rows.map((r) => {
    const parts = (r.contact_name ?? '').split(' ');
    return { email: r.email, first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') };
  });
}

async function getManagerRecipients(): Promise<Recipient[]> {
  const result = await query<{ email: string; full_name: string }>(
    `SELECT email, full_name FROM admins WHERE is_active = true ORDER BY created_at DESC`
  );
  return result.rows.map((r) => {
    const parts = (r.full_name ?? '').split(' ');
    return { email: r.email, first_name: parts[0] ?? '', last_name: parts.slice(1).join(' ') };
  });
}

// ─── Recipient COUNT helpers (efficient — no row fetching) ────────────────────

async function countPublisherRecipients(filters: { status?: string; country?: string }): Promise<number> {
  const conditions: string[] = [];
  const values: unknown[]    = [];
  let idx = 1;

  if (filters.status)  { conditions.push(`account_status = $${idx++}`); values.push(filters.status.toUpperCase()); }
  if (filters.country) { conditions.push(`country_code ILIKE $${idx++}`); values.push(`%${filters.country}%`); }

  const where  = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query<{ count: string }>(`SELECT COUNT(*) AS count FROM publishers ${where}`, values);
  return parseInt(result.rows[0]?.count ?? '0', 10);
}

async function countAdvertiserRecipients(filters: { status?: string; country?: string }): Promise<number> {
  const conditions: string[] = [];
  const values: unknown[]    = [];
  let idx = 1;

  if (filters.status)  { conditions.push(`status = $${idx++}`); values.push(filters.status.toUpperCase()); }
  if (filters.country) { conditions.push(`country ILIKE $${idx++}`); values.push(`%${filters.country}%`); }

  const where  = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await query<{ count: string }>(`SELECT COUNT(*) AS count FROM advertisers ${where}`, values);
  return parseInt(result.rows[0]?.count ?? '0', 10);
}

async function countManagerRecipients(): Promise<number> {
  const result = await query<{ count: string }>(`SELECT COUNT(*) AS count FROM admins WHERE is_active = true`);
  return parseInt(result.rows[0]?.count ?? '0', 10);
}

// ─── Bulk send ────────────────────────────────────────────────────────────────

export async function sendBulkMail(payload: BulkMailPayload): Promise<{
  sent: number;
  failed: number;
  total: number;
}> {
  const filters = payload.filters ?? {};

  let recipients: Recipient[];
  if (payload.recipient_type === 'publisher') {
    recipients = await getPublisherRecipients(filters);
  } else if (payload.recipient_type === 'advertiser') {
    recipients = await getAdvertiserRecipients(filters);
  } else {
    recipients = await getManagerRecipients();
  }

  if (recipients.length > BULK_SEND_CAP) {
    throw new Error(
      `Bulk send is capped at ${BULK_SEND_CAP} recipients. Your query matched ${recipients.length}. ` +
      `Apply filters (status, country) to narrow the list.`
    );
  }

  const settings = await getSmtpSettings();
  if (!settings.is_enabled || !settings.host.trim()) {
    throw new Error('SMTP not configured or disabled');
  }

  const [netVars] = await Promise.all([getNetworkVars()]);

  const transporter = createTransport(settings);

  let sent   = 0;
  let failed = 0;

  for (const recipient of recipients) {
    const vars: MailVariables = {
      // Network-level variables (auto-populated)
      network_name: netVars.network_name,
      login_url:    netVars.login_url,
      // Per-recipient variables
      first_name:   recipient.first_name,
      last_name:    recipient.last_name,
      email:        recipient.email,
      // Admin-supplied extra variables override all above
      ...(payload.extra_variables ?? {}),
    };

    const subject = renderVariables(payload.subject, vars);
    const html    = renderVariables(payload.body_html, vars);

    try {
      await transporter.sendMail({
        from:    `"${settings.from_name}" <${settings.from_email}>`,
        replyTo: settings.reply_to || undefined,
        to:      recipient.email,
        subject,
        html,
      });
      await insertEmailLog(recipient.email, subject, payload.template_slug ?? null, 'sent', null);
      sent++;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      await insertEmailLog(recipient.email, subject, payload.template_slug ?? null, 'failed', msg);
      failed++;
    }
  }

  return { sent, failed, total: recipients.length };
}

// ─── Preview (COUNT only — no row fetching) ───────────────────────────────────

export async function previewBulkRecipients(
  recipientType: string,
  filters: { status?: string; country?: string }
): Promise<number> {
  if (recipientType === 'publisher')  return countPublisherRecipients(filters);
  if (recipientType === 'advertiser') return countAdvertiserRecipients(filters);
  return countManagerRecipients();
}

// ─── Template list (re-export for controller convenience) ─────────────────────

export { listTemplates, getTemplateBySlug };
