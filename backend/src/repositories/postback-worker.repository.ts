import { pool } from '../db/index.js';
import { query } from '../db/index.js';
import { PostbackQueueRecord } from '../types/postback.js';

// Processing lease duration. A claimed row's next_retry_at is pushed this far
// into the future so concurrent workers skip it. On success/retry/fail the
// correct value is always written before the lease would expire.
const CLAIM_LEASE_SECONDS = 600;

export async function fetchAndClaimDuePostbacks(limit: number): Promise<PostbackQueueRecord[]> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query<PostbackQueueRecord>(
      `SELECT * FROM postbacks
       WHERE status IN ('QUEUED', 'RETRY')
         AND next_retry_at <= NOW()
       ORDER BY next_retry_at ASC
       LIMIT $1
       FOR UPDATE SKIP LOCKED`,
      [limit]
    );

    if (rows.length === 0) {
      await client.query('COMMIT');
      return [];
    }

    const ids = rows.map(r => r.id);
    await client.query(
      `UPDATE postbacks
       SET attempt_count   = attempt_count + 1,
           last_attempt_at = NOW(),
           next_retry_at   = NOW() + ($1 || ' seconds')::INTERVAL,
           updated_at      = NOW()
       WHERE id = ANY($2::uuid[])`,
      [CLAIM_LEASE_SECONDS, ids]
    );

    await client.query('COMMIT');
    // Return rows with the incremented attempt_count so the worker uses the correct value
    return rows.map(r => ({ ...r, attempt_count: r.attempt_count + 1 }));
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function markSuccess(
  id: string,
  conversionId: string,
  responseCode: number,
  responseBody: string
): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE postbacks
       SET status             = 'SUCCESS',
           last_response_code = $1,
           last_response_body = $2,
           next_retry_at      = NULL,
           updated_at         = NOW()
       WHERE id = $3`,
      [responseCode, responseBody, id]
    );
    await client.query(
      `UPDATE conversions
       SET postback_sent_at = NOW(),
           updated_at       = NOW()
       WHERE id = $1
         AND postback_sent_at IS NULL`,
      [conversionId]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export async function markRetry(
  id: string,
  nextRetryAt: Date,
  responseCode: number | null,
  responseBody: string | null
): Promise<void> {
  await query(
    `UPDATE postbacks
     SET status             = 'RETRY',
         last_response_code = $1,
         last_response_body = $2,
         next_retry_at      = $3,
         updated_at         = NOW()
     WHERE id = $4`,
    [responseCode, responseBody, nextRetryAt, id]
  );
}

export async function markFailed(
  id: string,
  responseCode: number | null,
  responseBody: string | null
): Promise<void> {
  await query(
    `UPDATE postbacks
     SET status             = 'FAILED',
         last_response_code = $1,
         last_response_body = $2,
         next_retry_at      = NULL,
         updated_at         = NOW()
     WHERE id = $3`,
    [responseCode, responseBody, id]
  );
}
