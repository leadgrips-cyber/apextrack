import { query } from "../db/index.js";
import { EmailLog } from "../types/mailer.js";

export async function insertEmailLog(
  recipient: string,
  subject: string | null,
  templateSlug: string | null,
  status: 'sent' | 'failed' | 'pending',
  error: string | null
): Promise<void> {
  await query(
    `INSERT INTO email_logs (recipient, subject, template_slug, status, error)
     VALUES ($1, $2, $3, $4, $5)`,
    [recipient, subject, templateSlug, status, error]
  );
}

export async function listEmailLogs(params: {
  status?: string;
  recipient?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: EmailLog[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (params.status) {
    conditions.push(`status = $${idx++}`);
    values.push(params.status);
  }
  if (params.recipient) {
    conditions.push(`recipient ILIKE $${idx++}`);
    values.push(`%${params.recipient}%`);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) AS count FROM email_logs ${where}`,
    values
  );
  const total = parseInt(countResult.rows[0]?.count ?? '0', 10);

  const limit = params.limit ?? 50;
  const offset = params.offset ?? 0;

  const dataResult = await query<EmailLog>(
    `SELECT * FROM email_logs ${where} ORDER BY sent_at DESC LIMIT $${idx++} OFFSET $${idx++}`,
    [...values, limit, offset]
  );

  return { logs: dataResult.rows, total };
}
