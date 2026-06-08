export interface TrackingLinkRecord {
  id: string;
  publisher_id: string;
  offer_id: number;
  sub1?: string | null;
  sub2?: string | null;
  sub3?: string | null;
  sub4?: string | null;
  sub5?: string | null;
  tracking_url: string;
  created_at: string;
  updated_at: string;
}

export interface TrackingLinkCreatePayload {
  offer_id: number;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
}
