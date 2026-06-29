import * as publisherRepository from "../repositories/publisher.repository.js";
import * as notificationService from "./notifications.service.js";
import { sendTemplateEmail } from "./mailer.service.js";
import { OfferApplicationRecord } from "../types/application.js";
import { TrackingLinkRecord } from "../types/tracking.js";
import { hashPassword } from "../utils/hash.js";

export interface PublisherPerformanceSummary {
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  total_payout: number;
}

export interface PublisherSummaryResult {
  publisher: Omit<publisherRepository.PublisherAdminRecord, 'total_clicks' | 'total_conversions' | 'total_revenue' | 'total_payout'> & PublisherPerformanceSummary & { profile_metadata?: Record<string, unknown> | null };
}

export interface PublisherListResult {
  publishers: Array<Omit<publisherRepository.PublisherAdminRecord, 'total_clicks' | 'total_conversions' | 'total_revenue' | 'total_payout'> & PublisherPerformanceSummary>;
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface ManagerListResult {
  managers: publisherRepository.ManagerRecord[];
}

const VALID_ACCOUNT_STATUSES = ['pending', 'active', 'suspended', 'blocked'] as const;
type AccountStatus = typeof VALID_ACCOUNT_STATUSES[number];

function normalizeStatus(status?: string): string | undefined {
  if (!status || typeof status !== 'string') {
    return undefined;
  }

  const normalized = status.trim().toLowerCase();
  if (normalized === 'pending') return 'PENDING';
  if (normalized === 'active') return 'ACTIVE';
  if (normalized === 'suspended') return 'SUSPENDED';
  if (normalized === 'blocked') return 'DEACTIVATED';
  return undefined;
}

function formatStatus(status: string): string {
  if (status === 'DEACTIVATED') return 'blocked';
  return String(status).toLowerCase();
}

function sanitizePublisherRow(
  row: publisherRepository.PublisherAdminRecord
): Omit<publisherRepository.PublisherAdminRecord, 'total_clicks' | 'total_conversions' | 'total_revenue' | 'total_payout'> & PublisherPerformanceSummary {
  return {
    id: row.id,
    email: row.email,
    login_name: row.login_name,
    full_name: row.full_name,
    company_name: row.company_name,
    country_code: row.country_code,
    timezone: row.timezone,
    account_status: formatStatus(row.account_status),
    approval_status: row.approval_status,
    assigned_manager_id: row.assigned_manager_id,
    manager_name: row.manager_name || null,
    affiliate_code: row.affiliate_code,
    is_active: row.is_active,
    currency: row.currency,
    profile_metadata: row.profile_metadata ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    approved_at: row.approved_at,
    rejected_reason: row.rejected_reason,
    email_verified: row.email_verified ?? false,
    total_clicks: Number(row.total_clicks),
    total_conversions: Number(row.total_conversions),
    total_revenue: Number(row.total_revenue),
    total_payout: Number(row.total_payout),
  };
}

function validateStatusValue(status?: string): asserts status is AccountStatus {
  if (!status) {
    throw new Error('Status value is required');
  }

  const normalized = status.trim().toLowerCase();
  if (!VALID_ACCOUNT_STATUSES.includes(normalized as AccountStatus)) {
    throw new Error('Invalid status value');
  }
}

export async function listPublishers(filters: publisherRepository.PublisherListFilters): Promise<PublisherListResult> {
  const raw = await publisherRepository.findPublishers(filters);
  return {
    publishers: raw.publishers.map(sanitizePublisherRow),
    pagination: {
      total: raw.total,
      page: raw.page,
      pageSize: raw.pageSize,
    },
  };
}

export async function getPublisherDetails(publisherId: string) {
  const publisher = await publisherRepository.findPublisherById(publisherId);
  if (!publisher) {
    throw new Error('Publisher not found');
  }
  return sanitizePublisherRow(publisher);
}

export async function approvePublisher(publisherId: string) {
  const updated = await publisherRepository.updatePublisherStatus(publisherId, {
    account_status: 'ACTIVE',
    approval_status: 'APPROVED',
    is_active: true,
    approved_at: new Date().toISOString(),
    rejected_reason: null,
  });
  if (!updated) {
    throw new Error('Publisher not found');
  }
  await publisherRepository.ensurePublisherWallet(publisherId);

  try {
    await notificationService.createNotification({
      publisher_id: publisherId,
      title: 'Account Approved',
      message: 'Your publisher account has been approved and is now active.',
      notification_type: 'system',
    });
  } catch (_err) { /* notification failure must not interrupt approval */ }

  const pub = sanitizePublisherRow(updated);
  const firstName = (pub.full_name ?? '').split(' ')[0] ?? '';
  sendTemplateEmail(pub.email, 'affiliate_approved', { first_name: firstName, email: pub.email }).catch(() => {});

  return pub;
}

export async function rejectPublisher(publisherId: string, reason?: string) {
  const updated = await publisherRepository.updatePublisherStatus(publisherId, {
    account_status: 'DEACTIVATED',
    approval_status: 'REJECTED',
    is_active: false,
    rejected_reason: reason ?? null,
  });
  if (!updated) {
    throw new Error('Publisher not found');
  }

  try {
    await notificationService.createNotification({
      publisher_id: publisherId,
      title: 'Application Update',
      message: 'Your affiliate application has been reviewed. Please check your email for details.',
      notification_type: 'system',
    });
  } catch (_err) { /* notification failure must not interrupt rejection */ }

  const pub = sanitizePublisherRow(updated);
  const firstName = (pub.full_name ?? '').split(' ')[0] ?? '';
  sendTemplateEmail(pub.email, 'affiliate_rejected', { first_name: firstName, email: pub.email }).catch(() => {});

  return pub;
}

export async function suspendPublisher(publisherId: string) {
  const updated = await publisherRepository.updatePublisherStatus(publisherId, {
    account_status: 'SUSPENDED',
    is_active: false,
  });
  if (!updated) {
    throw new Error('Publisher not found');
  }
  const pub = sanitizePublisherRow(updated);
  const firstName = (pub.full_name ?? '').split(' ')[0] ?? '';
  sendTemplateEmail(pub.email, 'affiliate_suspended', { first_name: firstName, email: pub.email }).catch(() => {});
  return pub;
}

export async function reactivatePublisher(publisherId: string) {
  // Check existing status before update so we can route correctly:
  // PENDING → ACTIVE is a first-time approval (send affiliate_approved + set approval fields)
  // SUSPENDED → ACTIVE is a reactivation (no approval email)
  const existing = await publisherRepository.findPublisherById(publisherId);
  if (!existing) throw new Error('Publisher not found');

  const wasPending = existing.account_status?.toUpperCase() === 'PENDING';

  const updated = await publisherRepository.updatePublisherStatus(publisherId, {
    account_status: 'ACTIVE',
    is_active: true,
    ...(wasPending ? {
      approval_status: 'APPROVED',
      approved_at: new Date().toISOString(),
      rejected_reason: null,
    } : {}),
  });
  if (!updated) {
    throw new Error('Publisher not found');
  }
  await publisherRepository.ensurePublisherWallet(publisherId);

  if (wasPending) {
    try {
      await notificationService.createNotification({
        publisher_id: publisherId,
        title: 'Account Approved',
        message: 'Your publisher account has been approved and is now active.',
        notification_type: 'system',
      });
    } catch (_err) { /* notification failure must not interrupt approval */ }

    const pub = sanitizePublisherRow(updated);
    const firstName = (pub.full_name ?? '').split(' ')[0] ?? '';
    sendTemplateEmail(pub.email, 'affiliate_approved', { first_name: firstName, email: pub.email }).catch(() => {});
    return pub;
  }

  return sanitizePublisherRow(updated);
}

export async function blockPublisher(publisherId: string) {
  const updated = await publisherRepository.updatePublisherStatus(publisherId, {
    account_status: 'DEACTIVATED',
    is_active: false,
  });
  if (!updated) {
    throw new Error('Publisher not found');
  }
  const pub = sanitizePublisherRow(updated);
  const firstName = (pub.full_name ?? '').split(' ')[0] ?? '';
  sendTemplateEmail(pub.email, 'affiliate_suspended', { first_name: firstName, email: pub.email }).catch(() => {});
  return pub;
}

export async function getPublisherWallet(publisherId: string): Promise<publisherRepository.PublisherWalletRecord> {
  const wallet = await publisherRepository.findPublisherWallet(publisherId);
  if (!wallet) {
    throw new Error('Wallet not found for publisher');
  }
  return wallet;
}

export async function listPublisherApplications(publisherId: string): Promise<OfferApplicationRecord[]> {
  return publisherRepository.findPublisherApplicationsByPublisher(publisherId);
}

export async function listPublisherTrackingLinks(publisherId: string): Promise<TrackingLinkRecord[]> {
  return publisherRepository.findPublisherTrackingLinksByPublisher(publisherId);
}

export async function listManagers(): Promise<ManagerListResult> {
  const managers = await publisherRepository.findManagersForAssignment();
  return { managers };
}

export interface AdminCreatePublisherInput {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  country_code: string;
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
  assigned_manager_id: string | null;
  telegram: string | null;
  skype: string | null;
  whatsapp: string | null;
  tracking_domain: string | null;
  traffic_source: string | null;
  postback_url: string | null;
}

export async function adminCreatePublisher(input: AdminCreatePublisherInput) {
  const password_hash = await hashPassword(input.password);

  const is_active = input.status === 'ACTIVE';
  const approval_status = input.status === 'ACTIVE' ? 'APPROVED' : 'PENDING';

  let created: publisherRepository.PublisherAdminRecord;
  try {
    created = await publisherRepository.insertPublisherByAdmin({
      first_name: input.first_name,
      last_name: input.last_name,
      email: input.email,
      password_hash,
      country_code: input.country_code,
      account_status: input.status,
      approval_status,
      is_active,
      assigned_manager_id: input.assigned_manager_id,
      telegram: input.telegram,
      skype: input.skype,
      whatsapp: input.whatsapp,
      tracking_domain: input.tracking_domain,
      traffic_source: input.traffic_source,
      postback_url: input.postback_url,
    });
  } catch (err: any) {
    if (err.code === '23505') {
      throw new Error('A publisher with this email already exists');
    }
    throw err;
  }

  if (input.status === 'ACTIVE') {
    await publisherRepository.ensurePublisherWallet(created.id);
  }

  return sanitizePublisherRow(created);
}

export interface AdminUpdatePublisherProfileInput {
  full_name?: string;
  email?: string;
  login_name?: string;
  company_name?: string;
  country_code?: string;
  account_status?: string;
  new_password?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state_name?: string;
  postal_code?: string;
  payment_method?: string;
  payment_details?: string;
  payment_term?: string;
  internal_notes?: string;
  traffic_quality_notes?: string;
  risk_score?: string;
  telegram?: string;
  skype?: string;
  whatsapp?: string;
  manager_notes?: string;
  manager_recommendation?: string;
  manager_notes_updated_at?: string;
}

export async function updatePublisherProfile(publisherId: string, input: AdminUpdatePublisherProfileInput) {
  const existing = await publisherRepository.findPublisherById(publisherId);
  if (!existing) throw new Error('Publisher not found');

  const profilePatch: Record<string, unknown> = {};
  const metaFields = ['phone', 'website', 'address', 'city', 'state_name', 'postal_code',
    'payment_method', 'payment_details', 'payment_term', 'internal_notes',
    'traffic_quality_notes', 'risk_score', 'telegram', 'skype', 'whatsapp',
    'manager_notes', 'manager_recommendation', 'manager_notes_updated_at'] as const;
  for (const f of metaFields) {
    if (input[f] !== undefined) profilePatch[f] = input[f];
  }

  let password_hash: string | undefined;
  if (input.new_password && input.new_password.trim()) {
    password_hash = await hashPassword(input.new_password.trim());
  }

  const updated = await publisherRepository.updatePublisherProfile(publisherId, {
    full_name: input.full_name,
    email: input.email,
    login_name: input.login_name,
    company_name: input.company_name,
    country_code: input.country_code,
    account_status: input.account_status?.toUpperCase(),
    password_hash,
    profile_metadata_patch: Object.keys(profilePatch).length > 0 ? profilePatch : undefined,
  });
  if (!updated) throw new Error('Publisher not found');

  // When admin manually sets status to ACTIVE via profile edit, treat it as a formal approval:
  // set approval fields and send the affiliate_approved email (same as approvePublisher)
  const normalizedNewStatus = input.account_status?.trim().toUpperCase();
  if (
    normalizedNewStatus === 'ACTIVE' &&
    existing.account_status?.toUpperCase() !== 'ACTIVE'
  ) {
    await publisherRepository.updatePublisherStatus(publisherId, {
      approval_status: 'APPROVED',
      is_active: true,
      approved_at: new Date().toISOString(),
      rejected_reason: null,
    });
    await publisherRepository.ensurePublisherWallet(publisherId);

    try {
      await notificationService.createNotification({
        publisher_id: publisherId,
        title: 'Account Approved',
        message: 'Your publisher account has been approved and is now active.',
        notification_type: 'system',
      });
    } catch (_err) { /* notification failure must not interrupt approval */ }

    const firstName = (updated.full_name ?? '').split(' ')[0] ?? '';
    sendTemplateEmail(updated.email, 'affiliate_approved', { first_name: firstName, email: updated.email }).catch(() => {});

    // Re-fetch to return up-to-date approval fields
    const refreshed = await publisherRepository.findPublisherById(publisherId);
    return sanitizePublisherRow(refreshed ?? updated);
  }

  // Send suspension/deactivation email when admin changes status via the profile form
  if (
    (normalizedNewStatus === 'SUSPENDED' || normalizedNewStatus === 'DEACTIVATED') &&
    existing.account_status?.toUpperCase() !== normalizedNewStatus
  ) {
    const firstName = (updated.full_name ?? '').split(' ')[0] ?? '';
    sendTemplateEmail(updated.email, 'affiliate_suspended', { first_name: firstName, email: updated.email }).catch(() => {});
  }

  return sanitizePublisherRow(updated);
}

export async function assignManager(publisherId: string, managerId: string) {
  const manager = await publisherRepository.findAdminById(managerId);
  if (!manager) {
    throw new Error('Manager not found');
  }

  const updated = await publisherRepository.updatePublisherStatus(publisherId, {
    assigned_manager_id: managerId,
  });
  if (!updated) {
    throw new Error('Publisher not found');
  }

  // Re-fetch to get manager_name from the JOIN
  return getPublisherDetails(publisherId);
}
