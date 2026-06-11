import * as applicationRepository from "../repositories/application.repository.js";
import * as offerRepository from "../repositories/offer.repository.js";
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

  if (application.status !== 'PENDING') {
    throw new Error('Only pending applications can be approved');
  }

  const updated = await applicationRepository.updateApplicationStatus(applicationId, 'APPROVED', adminId);
  if (!updated) {
    throw new Error('Failed to approve application');
  }

  return updated;
}

export async function rejectApplication(applicationId: string, adminId: string, payload: ApplicationReviewPayload) {
  const application = await applicationRepository.findApplicationById(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }

  if (application.status !== 'PENDING') {
    throw new Error('Only pending applications can be rejected');
  }

  const updated = await applicationRepository.updateApplicationStatus(applicationId, 'REJECTED', adminId, {
    rejection_reason: payload.rejection_reason || 'No reason provided',
  });

  if (!updated) {
    throw new Error('Failed to reject application');
  }

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
