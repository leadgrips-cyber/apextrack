import { hashPassword, comparePassword } from "../utils/hash.js";
import { signJwt } from "../utils/jwt.js";
import {
  AdvertiserSignupPayload,
  AdvertiserCreatePayload,
  AdvertiserFilterParams,
  AdvertiserUpdatePayload,
} from "../types/advertiser.js";
import * as repo from "../repositories/advertiser.repository.js";
import { sendVerificationEmail } from "./verification.service.js";
import { sendTemplateEmail } from "./mailer.service.js";

export async function signupAdvertiser(payload: AdvertiserSignupPayload) {
  const email = payload.email?.trim().toLowerCase();
  if (!email)                throw new Error('Email is required');
  if (!payload.company_name?.trim()) throw new Error('Company name is required');
  if (!payload.contact_name?.trim()) throw new Error('Contact name is required');
  if (!payload.password || payload.password.length < 8)
    throw new Error('Password must be at least 8 characters');

  const existing = await repo.findAdvertiserByEmail(email);
  if (existing) throw new Error('An account with this email already exists');

  const password_hash = await hashPassword(payload.password);
  const adv = await repo.insertAdvertiserSignup({
    company_name:      payload.company_name.trim(),
    contact_name:      payload.contact_name.trim(),
    email,
    password:          payload.password,
    password_hash,
    website:           payload.website?.trim()           || undefined,
    country:           payload.country?.trim()           || undefined,
    messenger_contact: payload.messenger_contact?.trim() || undefined,
  });

  // Non-blocking: send verification + signup notification; failures must not block account creation
  const firstName = (payload.contact_name?.trim() ?? '').split(' ')[0] ?? '';
  sendVerificationEmail('advertiser', adv.id, email, firstName).catch(() => {});
  sendTemplateEmail(email, 'advertiser_signup', { first_name: firstName, email }).catch(() => {});

  return adv;
}

export async function loginAdvertiser(email: string, password: string) {
  const adv = await repo.findAdvertiserByEmail(email?.trim().toLowerCase());
  if (!adv || !adv.password_hash) throw new Error('Invalid credentials');

  const valid = await comparePassword(password, adv.password_hash);
  if (!valid) throw new Error('Invalid credentials');

  if (!adv.is_active) throw new Error('Account awaiting admin approval');

  await repo.markAdvertiserLastLogin(adv.id);

  const token = signJwt({ sub: adv.id, role: 'advertiser' as any, email: adv.email });
  return {
    accessToken: token,
    tokenType:   'Bearer' as const,
    expiresIn:   Number(process.env.JWT_EXPIRES_IN_SECONDS || 3600),
    advertiser: {
      id:           adv.id,
      company_name: adv.company_name,
      contact_name: adv.contact_name,
      email:        adv.email,
    },
  };
}

export async function createAdvertiser(payload: AdvertiserCreatePayload, adminId: string) {
  const email = payload.email?.trim().toLowerCase();
  if (!email)                  throw new Error('Email is required');
  if (!payload.company_name?.trim()) throw new Error('Company name is required');
  if (!payload.contact_name?.trim()) throw new Error('Contact name is required');

  const existing = await repo.findAdvertiserByEmail(email);
  if (existing) throw new Error('An account with this email already exists');

  return repo.insertAdvertiser({
    company_name:      payload.company_name.trim(),
    contact_name:      payload.contact_name.trim(),
    email,
    phone:             payload.phone?.trim()             || undefined,
    website:           payload.website?.trim()           || undefined,
    country:           payload.country?.trim()           || undefined,
    messenger_contact: payload.messenger_contact?.trim() || undefined,
    status:            payload.status                    || 'ACTIVE',
    notes:             payload.notes?.trim()             || undefined,
    created_by_admin_id: adminId || null,
  });
}

export async function updateAdvertiser(id: string, payload: AdvertiserUpdatePayload) {
  const updates: AdvertiserUpdatePayload = {};

  if (payload.company_name    !== undefined) updates.company_name    = payload.company_name.trim();
  if (payload.contact_name    !== undefined) updates.contact_name    = payload.contact_name.trim();
  if (payload.email           !== undefined) updates.email           = payload.email.trim().toLowerCase();
  if (payload.phone           !== undefined) updates.phone           = payload.phone?.trim()             || undefined;
  if (payload.website         !== undefined) updates.website         = payload.website?.trim()           || undefined;
  if (payload.country         !== undefined) updates.country         = payload.country?.trim()           || undefined;
  if (payload.messenger_contact !== undefined) updates.messenger_contact = payload.messenger_contact?.trim() || undefined;
  if (payload.status          !== undefined) updates.status          = payload.status;
  if (payload.notes           !== undefined) updates.notes           = payload.notes?.trim()             || undefined;

  const updated = await repo.updateAdvertiserById(id, updates);
  if (!updated) throw new Error('Advertiser not found');
  return updated;
}

export async function activateAdvertiser(id: string) {
  const adv = await repo.setAdvertiserActive(id, true);
  if (!adv) throw new Error('Advertiser not found');
  const firstName = (adv.contact_name ?? '').split(' ')[0] ?? '';
  sendTemplateEmail(adv.email, 'advertiser_approved', { first_name: firstName, email: adv.email }).catch(() => {});
  return adv;
}

export async function deactivateAdvertiser(id: string) {
  const adv = await repo.setAdvertiserActive(id, false);
  if (!adv) throw new Error('Advertiser not found');
  return adv;
}

export async function getAdvertiser(id: string) {
  const adv = await repo.findAdvertiserById(id);
  if (!adv) throw new Error('Advertiser not found');
  return adv;
}

export async function listAdvertisers(filters: AdvertiserFilterParams) {
  return repo.findAdvertisers(filters);
}

export async function getAdvertiserCounts() {
  return repo.getAdvertiserCounts();
}
