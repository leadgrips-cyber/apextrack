export interface PublisherPostbackRecord {
  id: string;
  publisher_id: string;
  offer_id?: number | null;
  callback_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PublisherPostbackCreatePayload {
  offer_id?: number;
  callback_url: string;
  is_active?: boolean;
}

export interface PublisherPostbackUpdatePayload {
  offer_id?: number | null;
  callback_url?: string;
  is_active?: boolean;
}

export interface PublisherPostbackLogRecord {
  id: string;
  publisher_postback_id: string;
  conversion_id: string;
  click_id: string;
  offer_id: number;
  publisher_id: string;
  request_url: string;
  response_code?: number | null;
  response_body?: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
