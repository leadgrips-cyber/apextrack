const API_URL = "http://localhost:3000/api";

export async function verifyEmailToken(token: string): Promise<{
  status: 'verified' | 'already_verified' | 'expired' | 'invalid';
  user_type?: 'publisher' | 'advertiser';
}> {
  const res = await fetch(`${API_URL}/verify-email/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!res.ok) return { status: 'invalid' };
  return res.json();
}

export async function resendVerificationEmail(
  email: string,
  userType: 'publisher' | 'advertiser'
): Promise<void> {
  const res = await fetch(`${API_URL}/verify-email/resend`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, user_type: userType }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed to send verification email');
}

export async function getVerificationStats(): Promise<{
  publishers: { verified: number; unverified: number };
  advertisers: { verified: number; unverified: number };
}> {
  const token = localStorage.getItem('admin_token') || '';
  const res = await fetch(`${API_URL}/verify-email/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { message?: string }).message || 'Failed to fetch stats');
  return data;
}
