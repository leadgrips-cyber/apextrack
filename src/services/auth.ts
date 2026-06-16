const API_URL = "/api";

export class EmailNotVerifiedError extends Error {
  readonly code = 'EMAIL_NOT_VERIFIED' as const;
  readonly email: string;
  constructor(email: string, message: string) {
    super(message);
    this.name = 'EmailNotVerifiedError';
    this.email = email;
  }
}

export class AccountPendingError extends Error {
  readonly code = 'ACCOUNT_PENDING' as const;
  constructor(message: string) {
    super(message);
    this.name = 'AccountPendingError';
  }
}

export class AccountRejectedError extends Error {
  readonly code = 'ACCOUNT_REJECTED' as const;
  constructor(message: string) {
    super(message);
    this.name = 'AccountRejectedError';
  }
}

export class AccountSuspendedError extends Error {
  readonly code = 'ACCOUNT_SUSPENDED' as const;
  constructor(message: string) {
    super(message);
    this.name = 'AccountSuspendedError';
  }
}

async function attemptAdminLogin(email: string, password: string): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role: "admin" }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return (data as { accessToken?: string }).accessToken ?? null;
  } catch {
    return null;
  }
}

async function attemptPublisherLogin(email: string, password: string): Promise<string | null> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role: "publisher" }),
  });
  if (response.status === 403) {
    const data = await response.json().catch(() => ({})) as { code?: string; message?: string; email?: string };
    if (data.code === 'EMAIL_NOT_VERIFIED') {
      throw new EmailNotVerifiedError(data.email ?? email, data.message ?? 'Email not verified');
    }
    if (data.code === 'ACCOUNT_PENDING') {
      throw new AccountPendingError(data.message ?? 'Your account is pending approval.');
    }
    if (data.code === 'ACCOUNT_REJECTED') {
      throw new AccountRejectedError(data.message ?? 'Your application has been rejected.');
    }
    if (data.code === 'ACCOUNT_SUSPENDED') {
      throw new AccountSuspendedError(data.message ?? 'Your account has been suspended.');
    }
    return null;
  }
  if (!response.ok) return null;
  const data = await response.json().catch(() => ({})) as { accessToken?: string };
  return data.accessToken ?? null;
}

export async function login(email: string, password: string) {
  const [adminResult, publisherResult] = await Promise.allSettled([
    attemptAdminLogin(email, password),
    attemptPublisherLogin(email, password),
  ]);

  const adminToken = adminResult.status === 'fulfilled' ? adminResult.value : null;

  // If publisher login threw EMAIL_NOT_VERIFIED and admin login didn't succeed, surface it
  if (publisherResult.status === 'rejected' && !adminToken) {
    throw publisherResult.reason;
  }

  const publisherToken = publisherResult.status === 'fulfilled' ? publisherResult.value : null;

  if (!adminToken && !publisherToken) {
    throw new Error("Invalid credentials");
  }

  if (adminToken) localStorage.setItem("admin_token", adminToken);
  if (publisherToken) localStorage.setItem("token", publisherToken);

  return { accessToken: adminToken ?? publisherToken };
}

export async function register(
  email: string,
  password: string,
  fullName: string,
  loginName: string,
  companyName: string,
  cfTurnstileResponse?: string
) {
  const body: Record<string, unknown> = { email, password, fullName, loginName, companyName };
  if (cfTurnstileResponse) body['cf-turnstile-response'] = cfTurnstileResponse;

  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || "Registration failed");
  }

  return data;
}

export async function getCurrentUser() {
  // Prefer admin token so the admin panel gets a valid role back from /me.
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || "Failed to fetch user");
  }

  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(data.message || 'Request failed');
}

export async function resetPassword(token: string, password: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, password }),
  });
  const data = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(data.message || 'Reset failed');
}

export async function updateProfile(profileData: Record<string, string>) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error((data as { message?: string }).message || "Failed to update profile");
  }

  return data;
}
