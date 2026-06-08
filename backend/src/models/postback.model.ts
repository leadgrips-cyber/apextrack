export interface PostbackModel {
  id: string;
  conversion_id: string;
  offer_id: number;
  publisher_id: string;
  destination_url: string;
  payload: Record<string, unknown>;
  status: string;
  attempt_count: number;
  last_attempt_at?: string;
  next_retry_at?: string;
  last_response_code?: number;
  last_response_body?: string;
  created_at: string;
  updated_at: string;
}
