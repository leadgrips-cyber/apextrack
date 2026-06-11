const API_URL = "http://localhost:3000/api";

async function attemptLogin(email: string, password: string, role: "admin" | "publisher"): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.accessToken ?? null;
  } catch {
    return null;
  }
}

export async function login(email: string, password: string) {
  // Try both roles in parallel so a single set of credentials works for
  // admin users, publisher users, or accounts that exist in both tables.
  const [adminToken, publisherToken] = await Promise.all([
    attemptLogin(email, password, "admin"),
    attemptLogin(email, password, "publisher"),
  ]);

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
  companyName: string
) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
      fullName,
      loginName,
      companyName,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Registration failed");
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
    throw new Error(data.message || "Failed to fetch user");
  }

  return data;
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
    throw new Error(data.message || "Failed to update profile");
  }

  return data;
}
