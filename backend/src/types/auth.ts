export type UserRole = 'publisher' | 'admin';

import { Request } from 'express';

export interface AuthTokenPayload {
  sub: string;
  role: UserRole;
  email: string;
  issuedAt: number;
  expiresAt: number;
}

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

export interface LoginRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  loginName?: string;
  companyName?: string;
  countryCode?: string;
  timezone?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
}

export interface PublisherRecord {
  id: string;
  email: string;
  login_name: string;
  full_name: string;
  company_name?: string;
  account_status: string;
  approval_status: string;
  affiliate_code: string;
  profile_metadata?: Record<string, string> | null;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminRecord {
  id: string;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
  password_hash: string;
  created_at: string;
  updated_at: string;
}
