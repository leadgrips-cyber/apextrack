import * as repo from "../repositories/caps.repository.js";

export type { OfferCapsRecord } from "../repositories/caps.repository.js";

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export async function getCaps(offerId: number) {
  return repo.getCaps(offerId);
}

export async function saveCaps(
  offerId: number,
  fields: {
    daily_click_cap?: number | null;
    hourly_click_cap?: number | null;
    daily_conversion_cap?: number | null;
    hourly_conversion_cap?: number | null;
    is_active?: boolean;
  }
) {
  // Validate non-negative
  for (const [key, val] of Object.entries(fields)) {
    if (val !== null && val !== undefined && typeof val === "number" && val < 0) {
      throw new Error(`${key} must be >= 0`);
    }
  }
  return repo.upsertCaps(offerId, fields);
}

// ── Enforcement (called from click/conversion engines) ────────────────────────

export async function checkClickCaps(
  offerId: number
): Promise<{ blocked: boolean; reason: string }> {
  const caps = await repo.getCaps(offerId);
  if (!caps || !caps.is_active) return { blocked: false, reason: "" };

  if (caps.daily_click_cap !== null && caps.daily_click_cap > 0) {
    const today = await repo.countClicksToday(offerId);
    if (today >= caps.daily_click_cap) {
      return { blocked: true, reason: `Daily click cap reached (${today}/${caps.daily_click_cap})` };
    }
  }

  if (caps.hourly_click_cap !== null && caps.hourly_click_cap > 0) {
    const hour = await repo.countClicksThisHour(offerId);
    if (hour >= caps.hourly_click_cap) {
      return { blocked: true, reason: `Hourly click cap reached (${hour}/${caps.hourly_click_cap})` };
    }
  }

  return { blocked: false, reason: "" };
}

export async function checkConversionCaps(
  offerId: number
): Promise<{ blocked: boolean; reason: string }> {
  const caps = await repo.getCaps(offerId);
  if (!caps || !caps.is_active) return { blocked: false, reason: "" };

  if (caps.daily_conversion_cap !== null && caps.daily_conversion_cap > 0) {
    const today = await repo.countConversionsToday(offerId);
    if (today >= caps.daily_conversion_cap) {
      return { blocked: true, reason: `Daily conversion cap reached (${today}/${caps.daily_conversion_cap})` };
    }
  }

  if (caps.hourly_conversion_cap !== null && caps.hourly_conversion_cap > 0) {
    const hour = await repo.countConversionsThisHour(offerId);
    if (hour >= caps.hourly_conversion_cap) {
      return { blocked: true, reason: `Hourly conversion cap reached (${hour}/${caps.hourly_conversion_cap})` };
    }
  }

  return { blocked: false, reason: "" };
}
