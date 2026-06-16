const API_URL = "http://localhost:3000/api";

function authHeaders() {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listCategories(activeOnly = false): Promise<CategoryRecord[]> {
  const url = activeOnly
    ? `${API_URL}/offer-categories?active=true`
    : `${API_URL}/offer-categories`;
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to load categories");
  }
  const data = await res.json();
  return data.categories as CategoryRecord[];
}

export async function createCategory(name: string): Promise<CategoryRecord> {
  const res = await fetch(`${API_URL}/offer-categories`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to create category");
  }
  const data = await res.json();
  return data.category as CategoryRecord;
}

export async function updateCategory(
  id: string,
  fields: { name?: string; is_active?: boolean }
): Promise<CategoryRecord> {
  const res = await fetch(`${API_URL}/offer-categories/${id}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to update category");
  }
  const data = await res.json();
  return data.category as CategoryRecord;
}

export async function deleteCategory(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/offer-categories/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) {
    const d = await res.json().catch(() => ({}));
    throw new Error((d as any).message || "Failed to delete category");
  }
}
