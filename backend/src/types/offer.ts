export type OfferStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'EXHAUSTED' | 'CLOSED' | 'ARCHIVED';
export type TrackingProtocol = 'S2S' | 'COOKIE' | 'PIXEL' | 'SERVER';

export interface OfferRecord {
  id: number;
  name: string;
  slug: string;
  category: string;
  status: OfferStatus;
  requires_publisher_approval: boolean;
  payout_type: string;
  payout_amount: number;
  currency: string;
  target_geos: string[];
  target_devices: string[];
  landing_page_url: string;
  preview_url?: string | null;
  terms?: string | null;
  caps?: Record<string, unknown> | null;
  traffic_rules?: Record<string, unknown> | null;
  default_affiliate_commission: number;
  tracking_protocol: TrackingProtocol;
  admin_notes?: string | null;
  created_by_admin_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface OfferCreatePayload {
  name: string;
  slug?: string;
  category: string;
  status?: OfferStatus;
  requires_publisher_approval?: boolean;
  payout_type: string;
  payout_amount: number;
  currency?: string;
  target_geos?: string[];
  target_devices?: string[];
  landing_page_url: string;
  preview_url?: string;
  terms?: string;
  caps?: Record<string, unknown> | null;
  traffic_rules?: Record<string, unknown> | null;
  default_affiliate_commission?: number;
  tracking_protocol?: TrackingProtocol;
  admin_notes?: string;
}

export interface OfferUpdatePayload {
  name?: string;
  slug?: string;
  category?: string;
  status?: OfferStatus;
  requires_publisher_approval?: boolean;
  payout_type?: string;
  payout_amount?: number;
  currency?: string;
  target_geos?: string[];
  target_devices?: string[];
  landing_page_url?: string;
  preview_url?: string;
  terms?: string;
  caps?: Record<string, unknown> | null;
  traffic_rules?: Record<string, unknown> | null;
  default_affiliate_commission?: number;
  tracking_protocol?: TrackingProtocol;
  admin_notes?: string;
}

export interface OfferFilterParams {
  status?: OfferStatus;
  category?: string;
  geo?: string;
  device?: string;
  requires_publisher_approval?: boolean;
  search?: string;
}
