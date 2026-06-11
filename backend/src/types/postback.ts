export type PostbackStatus = 'pending' | 'approved' | 'rejected';

export interface PostbackRequestPayload {
  click_id: string;
  payout: string;
  revenue: string;
  status: PostbackStatus;
  transaction_id: string;
}

export interface ConversionRecord {
  id: string;
  click_id: string;
  offer_id: number;
  publisher_id: string;
  conversion_type: string;
  conversion_status: string;
  event_timestamp: string;
  payout_amount: string;
  revenue_amount: string;
  currency: string;
  revenue_currency: string;
  external_reference: string;
  s2s_payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WalletRecord {
  id: string;
  publisher_id: string;
  currency: string;
  available_balance: string;
  pending_balance: string;
  withdrawn_balance: string;
  hold_balance: string;
}

export interface WalletTransactionRecord {
  id: string;
  wallet_id: string;
  publisher_id: string;
  conversion_id?: string;
  offer_id?: number;
  transaction_type: string;
  amount: string;
  currency: string;
  balance_after: string;
  reference_id?: string;
  reference_type?: string;
  description: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PostbackQueueRecord {
  id: string;
  conversion_id: string;
  offer_id: number;
  publisher_id: string;
  publisher_postback_id: string | null;
  click_id: string | null;
  destination_url: string;
  payload: Record<string, string>;
  status: 'QUEUED' | 'SENT' | 'SUCCESS' | 'FAILED' | 'RETRY' | 'DISABLED';
  attempt_count: number;
  last_attempt_at: string | null;
  next_retry_at: string | null;
  last_response_code: number | null;
  last_response_body: string | null;
  http_method: string;
  headers: Record<string, string> | null;
  created_at: string;
  updated_at: string;
}
