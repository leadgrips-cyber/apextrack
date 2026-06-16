import * as repo from "../repositories/offer-creatives.repository.js";

const VALID_TYPES = ['IMAGE', 'BANNER', 'LOGO', 'HTML', 'VIDEO_URL', 'TRACKING_LINK'];

export async function listCreatives(offerId: number) {
  return repo.listCreatives(offerId);
}

export async function createCreative(offerId: number, body: {
  name: string;
  creative_type: string;
  file_url?: string | null;
  dimensions?: string | null;
  notes?: string | null;
}) {
  if (!body.name?.trim()) throw new Error('name is required');
  const type = (body.creative_type ?? '').toUpperCase();
  if (!VALID_TYPES.includes(type)) {
    throw new Error(`creative_type must be one of: ${VALID_TYPES.join(', ')}`);
  }
  return repo.insertCreative({
    offer_id: offerId,
    name: body.name.trim(),
    creative_type: type,
    file_url: body.file_url?.trim() || null,
    dimensions: body.dimensions?.trim() || null,
    notes: body.notes?.trim() || null,
  });
}

export async function updateCreative(id: string, body: {
  name?: string;
  creative_type?: string;
  file_url?: string | null;
  dimensions?: string | null;
  notes?: string | null;
}) {
  const patch: Parameters<typeof repo.updateCreative>[1] = {};
  if (body.name !== undefined) patch.name = body.name.trim();
  if (body.creative_type !== undefined) {
    const type = body.creative_type.toUpperCase();
    if (!VALID_TYPES.includes(type)) throw new Error(`creative_type must be one of: ${VALID_TYPES.join(', ')}`);
    patch.creative_type = type;
  }
  if (body.file_url !== undefined) patch.file_url = body.file_url?.trim() || null;
  if (body.dimensions !== undefined) patch.dimensions = body.dimensions?.trim() || null;
  if (body.notes !== undefined) patch.notes = body.notes?.trim() || null;

  const updated = await repo.updateCreative(id, patch);
  if (!updated) throw new Error('Creative not found');
  return updated;
}

export async function deleteCreative(id: string) {
  const deleted = await repo.deleteCreative(id);
  if (!deleted) throw new Error('Creative not found');
}
