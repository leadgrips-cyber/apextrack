export type ApplicationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface OfferApplicationRecord {
  id: string;
  offer_id: number;
  publisher_id: string;
  status: ApplicationStatus;
  requested_at: string;
  reviewed_at?: string | null;
  reviewed_by_admin_id?: string | null;
  rejection_reason?: string | null;
  comments?: string | null;
  submission_data?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  // Enriched via JOIN in admin list query
  offer_name?: string | null;
  offer_logo_url?: string | null;
  publisher_full_name?: string | null;
  publisher_company_name?: string | null;
}

export interface ApplicationCreatePayload {
  offer_id: number;
  comments?: string;
  submission_data?: Record<string, unknown>;
}

export interface ApplicationReviewPayload {
  rejection_reason?: string;
}

export interface ApplicationFilterParams {
  status?: ApplicationStatus;
  offer_id?: number;
  publisher_id?: string;
  search?: string;
}
