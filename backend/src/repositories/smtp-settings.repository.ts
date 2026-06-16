import { query } from "../db/index.js";
import { SmtpSettings, UpdateSmtpPayload } from "../types/mailer.js";

const SMTP_DEFAULTS: SmtpSettings = {
  id: 0, host: '', port: 587, username: '', password: '',
  from_name: '', from_email: '', reply_to: '',
  secure: false, is_enabled: false,
  updated_at: new Date().toISOString(),
};

export async function getSmtpSettings(): Promise<SmtpSettings> {
  const result = await query<SmtpSettings>(
    `SELECT * FROM smtp_settings ORDER BY id ASC LIMIT 1`
  );
  return result.rows[0] ?? SMTP_DEFAULTS;
}

export async function updateSmtpSettings(payload: UpdateSmtpPayload): Promise<SmtpSettings> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  const allowed: (keyof UpdateSmtpPayload)[] = [
    'host', 'port', 'username', 'password', 'from_name',
    'from_email', 'reply_to', 'secure', 'is_enabled'
  ];

  for (const key of allowed) {
    if (key in payload && payload[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push(payload[key]);
    }
  }

  if (fields.length === 0) {
    return getSmtpSettings();
  }

  fields.push(`updated_at = NOW()`);
  values.push(1); // id = 1 (single row)

  const result = await query<SmtpSettings>(
    `UPDATE smtp_settings SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  );
  return result.rows[0];
}
