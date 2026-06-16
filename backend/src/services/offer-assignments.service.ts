import * as repo from "../repositories/offer-assignments.repository.js";

export async function listPublishersWithAssignment(offerId: number, search?: string) {
  return repo.listPublishersWithAssignmentStatus(offerId, search);
}

export async function assignPublisher(offerId: number, publisherId: string, adminId: string) {
  if (!publisherId?.trim()) throw new Error('publisher_id is required');
  await repo.assignPublisher(offerId, publisherId.trim(), adminId);
}

export async function unassignPublisher(offerId: number, publisherId: string) {
  await repo.unassignPublisher(offerId, publisherId);
}

export async function bulkAssign(offerId: number, publisherIds: string[], adminId: string) {
  const ids = publisherIds.map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) throw new Error('No publisher IDs provided');
  await repo.bulkAssignPublishers(offerId, ids, adminId);
}

export async function bulkUnassign(offerId: number, publisherIds: string[]) {
  const ids = publisherIds.map((id) => id.trim()).filter(Boolean);
  if (ids.length === 0) throw new Error('No publisher IDs provided');
  await repo.bulkUnassignPublishers(offerId, ids);
}
