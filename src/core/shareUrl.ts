import { compressToBase64, decompressFromBase64 } from "lz-string";
import type { AggregateStats, ShareableReport } from "./types";

export function isShareableReport(x: unknown): x is ShareableReport {
  if (!x || typeof x !== "object") return false;
  const r = x as Record<string, unknown>;
  return (
    r.v === 1 &&
    typeof r.title === "string" &&
    typeof r.generatedAt === "string" &&
    Array.isArray(r.days) &&
    Array.isArray(r.rooms) &&
    typeof r.topLine === "object" &&
    Array.isArray(r.thresholds) &&
    Array.isArray(r.countries) &&
    Array.isArray(r.histogram)
  );
}

export function encodeReport(r: ShareableReport): string {
  return encodeURIComponent(compressToBase64(JSON.stringify(r)));
}

export function decodeReport(s: string): ShareableReport | null {
  if (!s) return null;
  let json: string | null = null;
  try {
    json = decompressFromBase64(decodeURIComponent(s));
  } catch {
    return null;
  }
  if (!json) return null;
  try {
    const obj: unknown = JSON.parse(json);
    if (!isShareableReport(obj)) return null;
    return obj;
  } catch {
    return null;
  }
}

/** Helper for the dashboard: derive the ShareableReport subset from a full AggregateStats. */
export function toShareable(stats: AggregateStats): ShareableReport {
  return {
    v: 1,
    title: stats.title,
    generatedAt: stats.generatedAt || new Date().toISOString(),
    days: stats.days,
    rooms: stats.rooms.map((r) => ({
      dayIdx: 0,
      label: r.roomLabel,
      webinarId: r.webinarId,
    })),
    topLine: stats.topLine,
    thresholds: stats.thresholds,
    countries: stats.countries,
    perDay: stats.perDay,
    histogram: stats.histogram,
    retention: stats.retention,
    peak: stats.peak,
    perRoom: stats.perRoom?.map((r) => ({
      label: r.roomLabel,
      webinarId: r.webinarId,
      unique: r.unique,
      countryCount: r.countryCount,
      thresholds: r.thresholds,
      countries: r.countries,
    })),
  };
}

/**
 * Build the public share link. Always points at the site root (`base`, e.g.
 * "/headcount/"), never at the current path, so links stay stable even when the
 * page was opened through a legacy URL.
 */
export function buildShareUrl(origin: string, base: string, encoded: string): string {
  return `${origin}${base}#report=${encoded}`;
}
