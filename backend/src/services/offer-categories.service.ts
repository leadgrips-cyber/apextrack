import * as repo from "../repositories/offer-categories.repository.js";
import type { CategoryRecord } from "../repositories/offer-categories.repository.js";

export type { CategoryRecord };

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export async function listCategories(activeOnly = false): Promise<CategoryRecord[]> {
  return repo.listCategories(activeOnly);
}

export async function createCategory(name: string): Promise<CategoryRecord> {
  const trimmed = name?.trim();
  if (!trimmed) throw new Error("Category name is required");
  if (trimmed.length > 128) throw new Error("Category name must be 128 characters or fewer");

  const existing = await repo.findCategoryByName(trimmed);
  if (existing) throw Object.assign(new Error("Category name already exists"), { code: "DUPLICATE" });

  const slug = toSlug(trimmed);
  const slugConflict = await repo.findCategoryBySlug(slug);
  const finalSlug = slugConflict ? `${slug}-${Date.now()}` : slug;

  return repo.insertCategory({ name: trimmed, slug: finalSlug });
}

export async function updateCategory(
  id: string,
  fields: { name?: string; is_active?: boolean }
): Promise<CategoryRecord> {
  const patch: Parameters<typeof repo.updateCategory>[1] = {};

  if (fields.name !== undefined) {
    const trimmed = fields.name.trim();
    if (!trimmed) throw new Error("Category name is required");

    const existing = await repo.findCategoryByName(trimmed);
    if (existing && existing.id !== id) {
      throw Object.assign(new Error("Category name already exists"), { code: "DUPLICATE" });
    }

    patch.name = trimmed;
    patch.slug = toSlug(trimmed);
  }

  if (fields.is_active !== undefined) {
    patch.is_active = Boolean(fields.is_active);
  }

  const updated = await repo.updateCategory(id, patch);
  if (!updated) throw new Error("Category not found");
  return updated;
}

export async function deleteCategory(id: string): Promise<void> {
  const deleted = await repo.deleteCategory(id);
  if (!deleted) throw new Error("Category not found");
}
