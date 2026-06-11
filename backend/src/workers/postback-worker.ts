import * as workerRepository from '../repositories/postback-worker.repository.js';
import { savePublisherPostbackLog } from '../repositories/publisher-postback.repository.js';
import { PostbackQueueRecord } from '../types/postback.js';

const MAX_ATTEMPTS = 4;

// Delay in milliseconds to schedule after each failed attempt.
// Key = attempt_count at time of failure (1-indexed).
const RETRY_DELAYS_MS: Record<number, number> = {
  1: 5 * 60 * 1000,   // 5 minutes after attempt 1 fails
  2: 15 * 60 * 1000,  // 15 minutes after attempt 2 fails
  3: 60 * 60 * 1000,  // 60 minutes after attempt 3 fails
};

async function processOnePostback(row: PostbackQueueRecord): Promise<void> {
  let responseCode: number | null = null;
  let responseBody: string | null = null;
  let success = false;

  try {
    const response = await fetch(row.destination_url, {
      method: row.http_method,
      signal: AbortSignal.timeout(10_000),
    });
    responseCode = response.status;
    responseBody = (await response.text()).slice(0, 2048);
    success = response.ok;
  } catch (err: any) {
    responseBody = (err?.message ?? String(err)).slice(0, 2048);
  }

  if (success) {
    await workerRepository.markSuccess(row.id, row.conversion_id, responseCode!, responseBody!);
  } else if (row.attempt_count >= MAX_ATTEMPTS) {
    await workerRepository.markFailed(row.id, responseCode, responseBody);
  } else {
    const delayMs = RETRY_DELAYS_MS[row.attempt_count];
    const nextRetryAt = new Date(Date.now() + delayMs);
    await workerRepository.markRetry(row.id, nextRetryAt, responseCode, responseBody);
  }

  if (row.publisher_postback_id && row.click_id) {
    try {
      await savePublisherPostbackLog({
        publisher_postback_id: row.publisher_postback_id,
        conversion_id: row.conversion_id,
        click_id: row.click_id,
        offer_id: row.offer_id,
        publisher_id: row.publisher_id,
        request_url: row.destination_url,
        response_code: responseCode,
        response_body: responseBody,
        status: success ? 'SUCCESS' : 'FAILED',
      });
    } catch (logErr) {
      console.error(`[postback-worker] Failed to write fire log for postback ${row.id}:`, logErr);
    }
  }
}

async function processDuePostbacks(): Promise<void> {
  let rows: PostbackQueueRecord[];
  try {
    rows = await workerRepository.fetchAndClaimDuePostbacks(100);
  } catch (err) {
    console.error('[postback-worker] Failed to fetch due postbacks:', err);
    return;
  }

  if (rows.length === 0) return;

  console.log(`[postback-worker] Processing ${rows.length} postback(s)`);

  for (const row of rows) {
    try {
      await processOnePostback(row);
    } catch (err) {
      console.error(`[postback-worker] Error processing postback ${row.id}:`, err);
    }
  }
}

export function startPostbackWorker(): void {
  processDuePostbacks().catch(err =>
    console.error('[postback-worker] Initial run failed:', err)
  );
  setInterval(() => {
    processDuePostbacks().catch(err =>
      console.error('[postback-worker] Tick failed:', err)
    );
  }, 60_000);
  console.log('[postback-worker] Started (60s poll interval)');
}
