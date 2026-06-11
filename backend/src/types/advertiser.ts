export type AdvertiserStatus = 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'PENDING';

export interface AdvertiserRecord {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  website?: string | null;
  status: AdvertiserStatus;
  notes?: string | null;
  created_by_admin_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvertiserCreatePayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  status?: AdvertiserStatus;
  notes?: string;
}

export interface AdvertiserUpdatePayload {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  status?: AdvertiserStatus;
  notes?: string;
}

export interface AdvertiserFilterParams {
  status?: AdvertiserStatus;
  search?: string;
}
