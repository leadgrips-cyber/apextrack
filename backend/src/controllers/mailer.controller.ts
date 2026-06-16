import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from "../types/auth.js";
import * as smtpRepo from "../repositories/smtp-settings.repository.js";
import * as tplRepo from "../repositories/email-templates.repository.js";
import * as logRepo from "../repositories/email-logs.repository.js";
import * as mailerSvc from "../services/mailer.service.js";
import { BulkMailPayload } from "../types/mailer.js";

// ─── SMTP Settings ─────────────────────────────────────────────────────────────

const PASSWORD_MASK = '••••••••';

export async function handleGetSmtp(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const settings = await smtpRepo.getSmtpSettings();
    // Return a masked password so plaintext is never exposed over the wire.
    // The frontend must send a new value to change it; sending the mask back is a no-op.
    const safe = {
      ...settings,
      password:         settings.password ? PASSWORD_MASK : '',
      password_is_set:  !!settings.password,
    };
    res.json({ settings: safe });
  } catch (err) { next(err); }
}

export async function handleUpdateSmtp(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = { ...req.body } as Record<string, unknown>;
    // If the admin did not change the password (sent back the mask or empty), drop it from the update
    if (body.password === PASSWORD_MASK || body.password === '') {
      delete body.password;
    }
    const settings = await smtpRepo.updateSmtpSettings(body);
    const safe = {
      ...settings,
      password:        settings.password ? PASSWORD_MASK : '',
      password_is_set: !!settings.password,
    };
    res.json({ settings: safe });
  } catch (err) { next(err); }
}

export async function handleTestSmtp(req: Request, res: Response, next: NextFunction) {
  try {
    const { to } = req.body as { to?: string };
    if (!to || !to.includes('@')) {
      res.status(400).json({ message: 'A valid recipient email is required' });
      return;
    }
    await mailerSvc.sendTestEmail(to);
    res.json({ success: true, message: `Test email sent to ${to}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send test email';
    res.status(502).json({ success: false, message: msg });
  }
}

export async function handleSmtpStatus(_req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await smtpRepo.getSmtpSettings();
    res.json({ configured: settings.is_enabled && !!settings.host.trim() });
  } catch (err) { next(err); }
}

// ─── Email Templates ──────────────────────────────────────────────────────────

export async function handleListTemplates(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const templates = await tplRepo.listTemplates();
    res.json({ templates });
  } catch (err) { next(err); }
}

export async function handleGetTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tpl = await tplRepo.getTemplateBySlug(req.params.slug);
    if (!tpl) { res.status(404).json({ message: 'Template not found' }); return; }
    res.json({ template: tpl });
  } catch (err) { next(err); }
}

export async function handleUpdateTemplate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const tpl = await tplRepo.updateTemplate(req.params.slug, req.body);
    if (!tpl) { res.status(404).json({ message: 'Template not found' }); return; }
    res.json({ template: tpl });
  } catch (err) { next(err); }
}

// ─── Bulk Mailer ──────────────────────────────────────────────────────────────

export async function handleBulkPreview(req: Request, res: Response, next: NextFunction) {
  try {
    const recipientType = req.query.recipient_type as string;
    if (!['publisher', 'advertiser', 'manager'].includes(recipientType)) {
      res.status(400).json({ message: 'recipient_type must be publisher, advertiser, or manager' });
      return;
    }
    const filters = {
      status: req.query.status as string | undefined,
      country: req.query.country as string | undefined,
    };
    const count = await mailerSvc.previewBulkRecipients(recipientType, filters);
    res.json({ count });
  } catch (err) { next(err); }
}

export async function handleBulkSend(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const payload = req.body as BulkMailPayload;

    if (!['publisher', 'advertiser', 'manager'].includes(payload.recipient_type)) {
      res.status(400).json({ message: 'Invalid recipient_type' });
      return;
    }
    if (!payload.subject?.trim()) {
      res.status(400).json({ message: 'subject is required' });
      return;
    }
    if (!payload.body_html?.trim()) {
      res.status(400).json({ message: 'body_html is required' });
      return;
    }

    const result = await mailerSvc.sendBulkMail(payload);
    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Bulk send failed';
    res.status(502).json({ message: msg });
  }
}

// ─── Email Logs ───────────────────────────────────────────────────────────────

export async function handleListLogs(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, recipient, page, limit } = req.query as Record<string, string | undefined>;
    const parsedLimit = Math.min(parseInt(limit ?? '50', 10), 200);
    const parsedPage  = Math.max(parseInt(page  ?? '1',  10), 1);

    const result = await logRepo.listEmailLogs({
      status,
      recipient,
      limit:  parsedLimit,
      offset: (parsedPage - 1) * parsedLimit,
    });

    res.json({ ...result, page: parsedPage, limit: parsedLimit });
  } catch (err) { next(err); }
}
