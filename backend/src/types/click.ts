export interface ClickRequestQuery {
  offer_id: string;
  publisher_id: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
}

export interface ClickRecord {
  click_id: string;
  offer_id: number;
  publisher_id: string;
  sub1?: string;
  sub2?: string;
  sub3?: string;
  sub4?: string;
  sub5?: string;
  click_ip: string;
  country_code?: string;
  device_type?: string;
  user_agent?: string;
  referrer?: string;
  redirect_url: string;
  landing_page_url: string;
  created_at: string;
  updated_at: string;
}

export interface OfferRecord {
  id: number;
  name: string;
  slug: string;
  status: string;
  requires_publisher_approval: boolean;
  landing_page_url: string;
}

export interface PublisherStatus {
  id: string;
  is_active: boolean;
}

export interface OfferApplicationStatus {
  id: string;
  status: string;
}
