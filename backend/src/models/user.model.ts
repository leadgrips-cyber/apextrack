export interface PublisherModel {
  id: string;
  email: string;
  login_name: string;
  full_name: string;
  company_name?: string;
  country_code?: string;
  timezone?: string;
  account_status: string;
  approval_status: string;
  affiliate_code: string;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminModel {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  password_hash: string;
  created_at: string;
  updated_at: string;
}
