export interface VerificationTokenRecord {
  id: string;
  user_type: 'publisher' | 'advertiser';
  user_id: string;
  token_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}
