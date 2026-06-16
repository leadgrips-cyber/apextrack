import * as repo from "../repositories/offer-landing-pages.repository.js";

export async function listLandingPages(offerId: number) {
  return repo.listLandingPages(offerId);
}

export async function createLandingPage(offerId: number, body: {
  name: string;
  url: string;
  preview_url?: string | null;
  is_active?: boolean;
}) {
  if (!body.name?.trim()) throw new Error('name is required');
  if (!body.url?.trim()) throw new Error('url is required');
  return repo.insertLandingPage({
    offer_id: offerId,
    name: body.name.trim(),
    url: body.url.trim(),
    preview_url: body.preview_url?.trim() || null,
    is_active: body.is_active ?? true,
  });
}

export async function updateLandingPage(id: string, body: {
  name?: string;
  url?: string;
  preview_url?: string | null;
  is_active?: boolean;
}) {
  const patch: Parameters<typeof repo.updateLandingPage>[1] = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.url !== undefined) patch.url = body.url.trim();
  if (body.preview_url !== undefined) patch.preview_url = body.preview_url?.trim() || null;
  if (body.is_active !== undefined) patch.is_active = body.is_active;

  const updated = await repo.updateLandingPage(id, patch);
  if (!updated) throw new Error('Landing page not found');
  return updated;
}

export async function deleteLandingPage(id: string) {
  const deleted = await repo.deleteLandingPage(id);
  if (!deleted) throw new Error('Landing page not found');
}
