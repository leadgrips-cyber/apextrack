export type AdvertiserStatus = 'ACTIVE' | 'PAUSED' | 'SUSPENDED' | 'PENDING';

export interface AdvertiserRecord {
  id: string;
  company_name: string;
  contact_name: string;
  email: string;
  password_hash?: string | null;
  phone?: string | null;
  website?: string | null;
  country?: string | null;
  messenger_contact?: string | null;
  status: AdvertiserStatus;
  is_active: boolean;
  notes?: string | null;
  created_by_admin_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdvertiserSignupPayload {
  company_name: string;
  contact_name: string;
  email: string;
  password: string;
  country?: string;
  website?: string;
  messenger_contact?: string;
}

export interface AdvertiserCreatePayload {
  company_name: string;
  contact_name: string;
  email: string;
  phone?: string;
  website?: string;
  country?: string;
  messenger_contact?: string;
  status?: AdvertiserStatus;
  notes?: string;
}

export interface AdvertiserUpdatePayload {
  company_name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  country?: string;
  messenger_contact?: string;
  status?: AdvertiserStatus;
  notes?: string;
}

export interface AdvertiserFilterParams {
  status?: AdvertiserStatus;
  is_active?: boolean;
  search?: string;
}
