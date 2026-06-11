import * as advertiserRepository from "../repositories/advertiser.repository.js";
import { AdvertiserCreatePayload, AdvertiserFilterParams, AdvertiserUpdatePayload, AdvertiserStatus } from "../types/advertiser.js";

const VALID_STATUSES: AdvertiserStatus[] = ['ACTIVE', 'PAUSED', 'SUSPENDED', 'PENDING'];

function normalizeStatus(value: unknown): AdvertiserStatus {
  const s = String(value || 'ACTIVE').toUpperCase() as AdvertiserStatus;
  return VALID_STATUSES.includes(s) ? s : 'ACTIVE';
}

export async function createAdvertiser(payload: AdvertiserCreatePayload, adminId: string) {
  const company = payload.company_name?.trim();
  if (!company) throw new Error('Company name is required');

  const contact = payload.contact_name?.trim();
  if (!contact) throw new Error('Contact name is required');

  const email = payload.email?.trim().toLowerCase();
  if (!email) throw new Error('Email is required');

  return await advertiserRepository.insertAdvertiser({
    company_name: company,
    contact_name: contact,
    email,
    phone: payload.phone?.trim() || undefined,
    website: payload.website?.trim() || undefined,
    status: normalizeStatus(payload.status),
    notes: payload.notes?.trim() || undefined,
    created_by_admin_id: adminId || null,
  });
}

export async function updateAdvertiser(id: string, payload: AdvertiserUpdatePayload) {
  const updates: AdvertiserUpdatePayload = {};

  if (payload.company_name !== undefined) updates.company_name = payload.company_name.trim();
  if (payload.contact_name !== undefined) updates.contact_name = payload.contact_name.trim();
  if (payload.email !== undefined) updates.email = payload.email.trim().toLowerCase();
  if (payload.phone !== undefined) updates.phone = payload.phone?.trim() || undefined;
  if (payload.website !== undefined) updates.website = payload.website?.trim() || undefined;
  if (payload.status !== undefined) updates.status = normalizeStatus(payload.status);
  if (payload.notes !== undefined) updates.notes = payload.notes?.trim() || undefined;

  const updated = await advertiserRepository.updateAdvertiserById(id, updates);
  if (!updated) throw new Error('Advertiser not found');
  return updated;
}

export async function getAdvertiser(id: string) {
  const advertiser = await advertiserRepository.findAdvertiserById(id);
  if (!advertiser) throw new Error('Advertiser not found');
  return advertiser;
}

export async function listAdvertisers(filters: AdvertiserFilterParams) {
  return await advertiserRepository.findAdvertisers(filters);
}
