import { query } from "../db/index.js";

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function listCategories(activeOnly = false): Promise<CategoryRecord[]> {
  const sql = activeOnly
    ? `SELECT * FROM offer_categories WHERE is_active = TRUE ORDER BY name ASC`
    : `SELECT * FROM offer_categories ORDER BY name ASC`;
  const result = await query<CategoryRecord>(sql);
  return result.rows;
}

export async function findCategoryById(id: string): Promise<CategoryRecord | null> {
  const result = await query<CategoryRecord>(
    `SELECT * FROM offer_categories WHERE id = $1 LIMIT 1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function findCategoryByName(name: string): Promise<CategoryRecord | null> {
  const result = await query<CategoryRecord>(
    `SELECT * FROM offer_categories WHERE lower(name) = lower($1) LIMIT 1`,
    [name]
  );
  return result.rows[0] ?? null;
}

export async function findCategoryBySlug(slug: string): Promise<CategoryRecord | null> {
  const result = await query<CategoryRecord>(
    `SELECT * FROM offer_categories WHERE slug = $1 LIMIT 1`,
    [slug]
  );
  return result.rows[0] ?? null;
}

export async function insertCategory(params: {
  name: string;
  slug: string;
}): Promise<CategoryRecord> {
  const result = await query<CategoryRecord>(
    `INSERT INTO offer_categories (name, slug, is_active, created_at, updated_at)
     VALUES ($1, $2, TRUE, NOW(), NOW()) RETURNING *`,
    [params.name, params.slug]
  );
  return result.rows[0];
}

export async function updateCategory(
  id: string,
  params: Partial<{ name: string; slug: string; is_active: boolean }>
): Promise<CategoryRecord | null> {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (params.name !== undefined) { values.push(params.name); fields.push(`name = $${values.length}`); }
  if (params.slug !== undefined) { values.push(params.slug); fields.push(`slug = $${values.length}`); }
  if (params.is_active !== undefined) { values.push(params.is_active); fields.push(`is_active = $${values.length}`); }

  if (fields.length === 0) {
    const r = await query<CategoryRecord>(`SELECT * FROM offer_categories WHERE id = $1`, [id]);
    return r.rows[0] ?? null;
  }

  values.push(id);
  const result = await query<CategoryRecord>(
    `UPDATE offer_categories SET ${fields.join(", ")}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
    values
  );
  return result.rows[0] ?? null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const result = await query(`DELETE FROM offer_categories WHERE id = $1`, [id]);
  return (result.rowCount ?? 0) > 0;
}
