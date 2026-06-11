import { PoolClient } from 'pg';
import { query, pool } from "../db/index.js";

export interface InvoicesSummary {
  total_invoices: string;
  total_gross: string;
  pending_count: string;
  pending_gross: string;
  paid_count: string;
  paid_gross: string;
  hold_count: string;
  hold_gross: string;
}

export interface InvoiceRow {
  id: string;
  invoice_number: string;
  publisher_id: string;
  publisher_name: string;
  publisher_email: string;
  period_start: string;
  period_end: string;
  gross_amount: string;
  fee_amount: string;
  net_amount: string;
  status: string;
  payout_method: string | null;
  notes: string | null;
  wallet_tx_id: string | null;
  generated_at: string;
  paid_at: string | null;
  created_at: string;
}

export async function getInvoicesSummary(): Promise<InvoicesSummary> {
  const result = await query<InvoicesSummary>(
    `SELECT
       COUNT(*)::TEXT                                                           AS total_invoices,
       COALESCE(SUM(gross_amount), 0)::TEXT                                    AS total_gross,
       COUNT(*) FILTER (WHERE status = 'PENDING')::TEXT                        AS pending_count,
       COALESCE(SUM(gross_amount) FILTER (WHERE status = 'PENDING'), 0)::TEXT  AS pending_gross,
       COUNT(*) FILTER (WHERE status = 'PAID')::TEXT                           AS paid_count,
       COALESCE(SUM(gross_amount) FILTER (WHERE status = 'PAID'), 0)::TEXT     AS paid_gross,
       COUNT(*) FILTER (WHERE status = 'HOLD')::TEXT                           AS hold_count,
       COALESCE(SUM(gross_amount) FILTER (WHERE status = 'HOLD'), 0)::TEXT     AS hold_gross
     FROM payout_invoices`,
    []
  );
  return result.rows[0] || {
    total_invoices: '0', total_gross: '0',
    pending_count: '0', pending_gross: '0',
    paid_count: '0', paid_gross: '0',
    hold_count: '0', hold_gross: '0',
  };
}

export async function listInvoices(params: {
  page: number;
  pageSize: number;
  status?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ rows: InvoiceRow[]; total: number }> {
  const clauses: string[] = [];
  const p: unknown[] = [];

  if (params.status) {
    p.push(params.status.toUpperCase());
    clauses.push(`pi.status = $${p.length}`);
  }
  if (params.search) {
    p.push(`%${params.search.toLowerCase()}%`);
    clauses.push(
      `(LOWER(pub.email) LIKE $${p.length} OR LOWER(pub.full_name) LIKE $${p.length} OR LOWER(pi.invoice_number) LIKE $${p.length})`
    );
  }
  if (params.startDate) {
    p.push(params.startDate);
    clauses.push(`pi.period_start >= $${p.length}`);
  }
  if (params.endDate) {
    p.push(params.endDate);
    clauses.push(`pi.period_start <= $${p.length}`);
  }

  const where  = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const countP = [...p];

  p.push(params.pageSize, (params.page - 1) * params.pageSize);
  const limitN  = p.length - 1;
  const offsetN = p.length;

  const [rowsResult, countResult] = await Promise.all([
    query<InvoiceRow>(
      `SELECT
         pi.id,
         pi.invoice_number,
         pi.publisher_id,
         pub.full_name  AS publisher_name,
         pub.email      AS publisher_email,
         pi.period_start::TEXT,
         pi.period_end::TEXT,
         pi.gross_amount::TEXT,
         pi.fee_amount::TEXT,
         pi.net_amount::TEXT,
         pi.status,
         pi.payout_method,
         pi.notes,
         pi.wallet_tx_id,
         pi.generated_at,
         pi.paid_at,
         pi.created_at
       FROM payout_invoices pi
       JOIN publishers pub ON pub.id = pi.publisher_id
       ${where}
       ORDER BY pi.created_at DESC
       LIMIT $${limitN} OFFSET $${offsetN}`,
      p
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)
       FROM payout_invoices pi
       JOIN publishers pub ON pub.id = pi.publisher_id
       ${where}`,
      countP
    ),
  ]);

  return { rows: rowsResult.rows, total: Number(countResult.rows[0]?.count ?? 0) };
}

export async function getInvoiceById(id: string): Promise<InvoiceRow | null> {
  const result = await query<InvoiceRow>(
    `SELECT
       pi.id, pi.invoice_number, pi.publisher_id,
       pub.full_name AS publisher_name, pub.email AS publisher_email,
       pi.period_start::TEXT, pi.period_end::TEXT,
       pi.gross_amount::TEXT, pi.fee_amount::TEXT, pi.net_amount::TEXT,
       pi.status, pi.payout_method, pi.notes, pi.wallet_tx_id,
       pi.generated_at, pi.paid_at, pi.created_at
     FROM payout_invoices pi
     JOIN publishers pub ON pub.id = pi.publisher_id
     WHERE pi.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const ym  = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const result = await query<{ count: string }>(
    `SELECT COUNT(*) FROM payout_invoices WHERE invoice_number LIKE $1`,
    [`APX-${ym}-%`]
  );
  const seq = Number(result.rows[0].count) + 1;
  return `APX-${ym}-${String(seq).padStart(3, '0')}`;
}

export async function createInvoice(params: {
  invoiceNumber: string;
  publisherId: string;
  periodStart: string;
  periodEnd: string;
  grossAmount: number;
  feeAmount: number;
  netAmount: number;
  payoutMethod?: string;
  notes?: string;
}): Promise<InvoiceRow> {
  const result = await query<{ id: string }>(
    `INSERT INTO payout_invoices (
       invoice_number, publisher_id, period_start, period_end,
       gross_amount, fee_amount, net_amount, status, payout_method, notes
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, 'PENDING', $8, $9)
     RETURNING id`,
    [
      params.invoiceNumber,
      params.publisherId,
      params.periodStart,
      params.periodEnd,
      params.grossAmount,
      params.feeAmount,
      params.netAmount,
      params.payoutMethod ?? null,
      params.notes ?? null,
    ]
  );
  const invoice = await getInvoiceById(result.rows[0].id);
  if (!invoice) throw new Error('Invoice creation failed');
  return invoice;
}

export async function markInvoicePaid(params: {
  invoiceId: string;
  description: string;
}): Promise<{ invoice: InvoiceRow; wallet_transaction_id: string }> {
  const client: PoolClient = await pool.connect();
  let walletTxId = '';

  try {
    await client.query('BEGIN');

    const invResult = await client.query<{
      id: string;
      publisher_id: string;
      net_amount: string;
      status: string;
    }>(
      `SELECT id, publisher_id, net_amount, status
       FROM payout_invoices WHERE id = $1 FOR UPDATE`,
      [params.invoiceId]
    );
    const inv = invResult.rows[0];
    if (!inv) throw new Error('Invoice not found');
    if (inv.status === 'PAID') throw new Error('Invoice is already paid');

    const netAmount = Number(inv.net_amount);

    const walletResult = await client.query<{
      id: string;
      available_balance: string;
      withdrawn_balance: string;
      currency: string;
    }>(
      `SELECT id, available_balance, withdrawn_balance, currency
       FROM wallets WHERE publisher_id = $1 LIMIT 1 FOR UPDATE`,
      [inv.publisher_id]
    );
    const wallet = walletResult.rows[0];
    if (!wallet) throw new Error('Publisher wallet not found');

    const available = Number(wallet.available_balance);
    if (netAmount > available) {
      throw new Error(
        `Insufficient balance. Available: ${available.toFixed(2)}, Required: ${netAmount.toFixed(2)}`
      );
    }

    const updatedWallet = await client.query<{ available_balance: string }>(
      `UPDATE wallets
         SET available_balance = available_balance - $1,
             withdrawn_balance = withdrawn_balance + $1,
             updated_at = NOW()
         WHERE id = $2
         RETURNING available_balance`,
      [netAmount, wallet.id]
    );
    const balanceAfter = Number(updatedWallet.rows[0].available_balance);

    const txResult = await client.query<{ id: string }>(
      `INSERT INTO wallet_transactions (
         wallet_id, publisher_id, transaction_type, amount, currency,
         balance_after, reference_type, reference_id, description, metadata, created_at, updated_at
       ) VALUES ($1, $2, 'WITHDRAWAL', $3, $4, $5, 'INVOICE_PAYOUT', $6, $7, '{}', NOW(), NOW())
       RETURNING id`,
      [
        wallet.id,
        inv.publisher_id,
        netAmount,
        wallet.currency,
        balanceAfter,
        params.invoiceId,
        params.description,
      ]
    );
    walletTxId = txResult.rows[0].id;

    await client.query(
      `UPDATE payout_invoices
         SET status = 'PAID', paid_at = NOW(), wallet_tx_id = $1, updated_at = NOW()
         WHERE id = $2`,
      [walletTxId, params.invoiceId]
    );

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  const updatedInvoice = await getInvoiceById(params.invoiceId);
  if (!updatedInvoice) throw new Error('Invoice retrieval failed after payment');
  return { invoice: updatedInvoice, wallet_transaction_id: walletTxId };
}

export async function setInvoiceStatus(
  id: string,
  status: 'HOLD' | 'PENDING'
): Promise<InvoiceRow | null> {
  const result = await query<{ id: string }>(
    `UPDATE payout_invoices
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND status != 'PAID'
       RETURNING id`,
    [status, id]
  );
  if (!result.rows[0]) return null;
  return getInvoiceById(id);
}

export async function updateInvoice(
  id: string,
  params: {
    periodStart?:  string;
    periodEnd?:    string;
    grossAmount?:  number;
    feeAmount?:    number;
    netAmount?:    number;
    payoutMethod?: string | null;
    notes?:        string | null;
  }
): Promise<InvoiceRow | null> {
  const sets: string[] = [];
  const p: unknown[]   = [];

  if (params.periodStart !== undefined) { p.push(params.periodStart); sets.push(`period_start = $${p.length}`); }
  if (params.periodEnd   !== undefined) { p.push(params.periodEnd);   sets.push(`period_end = $${p.length}`); }
  if (params.grossAmount !== undefined) { p.push(params.grossAmount); sets.push(`gross_amount = $${p.length}`); }
  if (params.feeAmount   !== undefined) { p.push(params.feeAmount);   sets.push(`fee_amount = $${p.length}`); }
  if (params.netAmount   !== undefined) { p.push(params.netAmount);   sets.push(`net_amount = $${p.length}`); }
  if ('payoutMethod' in params)         { p.push(params.payoutMethod ?? null); sets.push(`payout_method = $${p.length}`); }
  if ('notes' in params)                { p.push(params.notes ?? null);        sets.push(`notes = $${p.length}`); }

  if (sets.length === 0) return getInvoiceById(id);

  p.push(id);
  const result = await query<{ id: string }>(
    `UPDATE payout_invoices
       SET ${sets.join(', ')}, updated_at = NOW()
       WHERE id = $${p.length} AND status != 'PAID'
       RETURNING id`,
    p
  );
  if (!result.rows[0]) return null;
  return getInvoiceById(id);
}

export async function deleteInvoice(id: string): Promise<boolean> {
  const result = await query<{ id: string }>(
    `DELETE FROM payout_invoices WHERE id = $1 AND status != 'PAID' RETURNING id`,
    [id]
  );
  return !!result.rows[0];
}
