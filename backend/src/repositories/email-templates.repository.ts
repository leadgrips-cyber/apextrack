import { query } from "../db/index.js";
import { EmailTemplate, UpdateTemplatePayload } from "../types/mailer.js";

export async function listTemplates(): Promise<EmailTemplate[]> {
  const result = await query<EmailTemplate>(
    `SELECT * FROM email_templates ORDER BY id ASC`
  );
  return result.rows;
}

export async function getTemplateBySlug(slug: string): Promise<EmailTemplate | null> {
  const result = await query<EmailTemplate>(
    `SELECT * FROM email_templates WHERE slug = $1`,
    [slug]
  );
  return result.rows[0] ?? null;
}

export async function updateTemplate(
  slug: string,
  payload: UpdateTemplatePayload
): Promise<EmailTemplate | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (payload.subject !== undefined) {
    fields.push(`subject = $${idx++}`);
    values.push(payload.subject);
  }
  if (payload.body_html !== undefined) {
    fields.push(`body_html = $${idx++}`);
    values.push(payload.body_html);
  }
  if (payload.is_active !== undefined) {
    fields.push(`is_active = $${idx++}`);
    values.push(payload.is_active);
  }

  if (fields.length === 0) return getTemplateBySlug(slug);

  fields.push(`updated_at = NOW()`);
  values.push(slug);

  const result = await query<EmailTemplate>(
    `UPDATE email_templates SET ${fields.join(', ')} WHERE slug = $${idx} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}
