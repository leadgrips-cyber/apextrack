import * as applicationRepository from "../repositories/application.repository.js";
import * as offerRepository from "../repositories/offer.repository.js";
import * as publisherRepository from "../repositories/publisher.repository.js";
import * as notificationService from "./notifications.service.js";
import { sendTemplateEmail } from "./mailer.service.js";
import { ApplicationCreatePayload, ApplicationFilterParams, ApplicationReviewPayload, OfferApplicationRecord } from "../types/application.js";

export async function applyForOffer(publisherId: string, payload: ApplicationCreatePayload) {
  const offer = await offerRepository.findOfferById(payload.offer_id);
  if (!offer) {
    throw new Error('Offer not found');
  }

  if (offer.status !== 'ACTIVE') {
    throw new Error('Cannot apply for an offer that is not active');
  }

  const existing = await applicationRepository.findApplicationByOfferAndPublisher(payload.offer_id, publisherId);
  if (existing) {
    throw new Error('Application already exists for this offer');
  }

  return applicationRepository.insertApplication(publisherId, payload);
}

export async function approveApplication(applicationId: string, adminId: string) {
  const application = await applicationRepository.findApplicationById(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }

  if (application.status === 'APPROVED') {
    throw new Error('Application is already approved');
  }

  const updated = await applicationRepository.updateApplicationStatus(applicationId, 'APPROVED', adminId);
  if (!updated) {
    throw new Error('Failed to approve application');
  }

  const offer = await offerRepository.findOfferById(application.offer_id);
  const offerName = offer?.name ?? `Offer #${application.offer_id}`;
  try {
    await notificationService.createNotification({
      publisher_id: application.publisher_id,
      title: 'Offer Application Approved',
      message: `Your application for offer "${offerName}" has been approved.`,
      notification_type: 'approved',
    });
  } catch (_err) { /* notification failure must not interrupt approval */ }

  try {
    const publisher = await publisherRepository.findPublisherById(application.publisher_id);
    if (publisher) {
      const firstName = (publisher.full_name ?? '').split(' ')[0] ?? '';
      sendTemplateEmail(publisher.email, 'application_approved', {
        first_name: firstName,
        offer_name: offerName,
      }).catch(() => {});
    }
  } catch (_err) { /* email failure must not interrupt approval */ }

  return updated;
}

export async function rejectApplication(applicationId: string, adminId: string, payload: ApplicationReviewPayload) {
  const application = await applicationRepository.findApplicationById(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }

  if (application.status === 'REJECTED') {
    throw new Error('Application is already rejected');
  }

  const updated = await applicationRepository.updateApplicationStatus(applicationId, 'REJECTED', adminId, {
    rejection_reason: payload.rejection_reason || 'No reason provided',
  });

  if (!updated) {
    throw new Error('Failed to reject application');
  }

  const offer = await offerRepository.findOfferById(application.offer_id);
  const offerName = offer?.name ?? `Offer #${application.offer_id}`;
  try {
    await notificationService.createNotification({
      publisher_id: application.publisher_id,
      title: 'Offer Application Rejected',
      message: `Your application for offer "${offerName}" has been rejected.`,
      notification_type: 'rejected',
    });
  } catch (_err) { /* notification failure must not interrupt rejection */ }

  try {
    const publisher = await publisherRepository.findPublisherById(application.publisher_id);
    if (publisher) {
      const firstName = (publisher.full_name ?? '').split(' ')[0] ?? '';
      sendTemplateEmail(publisher.email, 'application_rejected', {
        first_name: firstName,
        offer_name: offerName,
      }).catch(() => {});
    }
  } catch (_err) { /* email failure must not interrupt rejection */ }

  return updated;
}

export async function listPublisherApplications(publisherId: string, filters: ApplicationFilterParams) {
  return applicationRepository.findApplications({ ...filters, publisher_id: publisherId });
}

export async function listApplications(filters: ApplicationFilterParams) {
  return applicationRepository.findApplications(filters);
}

export async function getApplicationDetails(applicationId: string) {
  const application = await applicationRepository.findApplicationById(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  return application;
}
