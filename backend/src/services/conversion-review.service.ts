import * as conversionReviewRepository from "../repositories/conversion-review.repository.js";
import * as notificationService from "./notifications.service.js";

export interface ConversionReviewFilters {
  status?: string;
  startDate?: string;
  endDate?: string;
  offerId?: number;
  publisherId?: string;
  publisherEmail?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function listConversions(filters: ConversionReviewFilters) {
  const page = Math.max(1, Number(filters.page) || 1);
  const pageSize = Math.min(Math.max(1, Number(filters.pageSize) || 25), 100);

  const { rows, total } = await conversionReviewRepository.listConversionsForReview({
    status: filters.status,
    startDate: filters.startDate,
    endDate: filters.endDate,
    offerId: filters.offerId,
    publisherId: filters.publisherId,
    publisherEmail: filters.publisherEmail,
    search: filters.search,
    page,
    pageSize,
  });

  return { conversions: rows, total, page, pageSize };
}

export async function approveConversion(id: string) {
  if (!id) throw new Error('Conversion ID is required');
  return conversionReviewRepository.approveConversion(id);
}

export async function rejectConversion(id: string, rejectionReason: string) {
  if (!id) throw new Error('Conversion ID is required');
  if (!rejectionReason?.trim()) throw new Error('Rejection reason is required');
  return conversionReviewRepository.rejectConversion(id, rejectionReason.trim());
}

export async function updateStatus(
  id: string,
  newStatus: string,
  adminId: string | null,
  adminEmail: string | null,
  reason: string | null
) {
  if (!id) throw new Error('Conversion ID is required');
  if (!newStatus?.trim()) throw new Error('New status is required');
  const result = await conversionReviewRepository.updateConversionStatus(id, newStatus.trim(), adminId, adminEmail, reason?.trim() || null);

  if (newStatus.trim().toUpperCase() === 'APPROVED') {
    try {
      await notificationService.createNotification({
        publisher_id: result.conversion.publisher_id,
        title: 'Conversion Approved',
        message: `Your conversion for offer "${result.conversion.offer_name}" has been approved. A payout of $${Number(result.conversion.payout_amount).toFixed(2)} has been credited to your account.`,
        notification_type: 'approved',
      });
    } catch (_err) { /* notification failure must not interrupt status update */ }
  }

  return result;
}

export async function getHistory(id: string) {
  if (!id) throw new Error('Conversion ID is required');
  return conversionReviewRepository.getConversionHistory(id);
}
