import * as repo from "../repositories/offer-events.repository.js";

const TOKEN_RE = /^[a-z0-9_]+$/;

function validateToken(token: string) {
  if (!token?.trim()) throw new Error('event_token is required');
  if (!TOKEN_RE.test(token.trim())) {
    throw new Error('event_token must contain only lowercase letters, digits, and underscores');
  }
}

function validateApprovalMode(mode: string) {
  if (mode !== 'AUTO_APPROVE' && mode !== 'MANUAL_REVIEW') {
    throw new Error('approval_mode must be AUTO_APPROVE or MANUAL_REVIEW');
  }
}

export async function listOfferEvents(offerId: number) {
  return repo.listEventsByOffer(offerId);
}

export async function createOfferEvent(offerId: number, body: {
  event_token: string;
  event_name: string;
  approval_mode: string;
  is_active: boolean;
}) {
  validateToken(body.event_token);
  if (!body.event_name?.trim()) throw new Error('event_name is required');
  validateApprovalMode(body.approval_mode);

  try {
    return await repo.insertEvent({
      offer_id: offerId,
      event_token: body.event_token.trim().toLowerCase(),
      event_name: body.event_name.trim(),
      approval_mode: body.approval_mode as 'AUTO_APPROVE' | 'MANUAL_REVIEW',
      is_active: body.is_active,
    });
  } catch (err: any) {
    if (err.code === '23505') throw new Error(`Event token "${body.event_token}" already exists for this offer`);
    throw err;
  }
}

export async function updateOfferEvent(id: string, body: {
  event_token?: string;
  event_name?: string;
  approval_mode?: string;
  is_active?: boolean;
}) {
  if (body.event_token !== undefined) validateToken(body.event_token);
  if (body.approval_mode !== undefined) validateApprovalMode(body.approval_mode);

  try {
    const updated = await repo.updateEvent(id, {
      ...(body.event_token !== undefined   && { event_token: body.event_token.trim().toLowerCase() }),
      ...(body.event_name !== undefined    && { event_name: body.event_name.trim() }),
      ...(body.approval_mode !== undefined && { approval_mode: body.approval_mode as 'AUTO_APPROVE' | 'MANUAL_REVIEW' }),
      ...(body.is_active !== undefined     && { is_active: body.is_active }),
    });
    if (!updated) throw new Error('Event not found');
    return updated;
  } catch (err: any) {
    if (err.code === '23505') throw new Error('Event token already exists for this offer');
    throw err;
  }
}

export async function deleteOfferEvent(id: string) {
  const deleted = await repo.deleteEvent(id);
  if (!deleted) throw new Error('Event not found');
}
