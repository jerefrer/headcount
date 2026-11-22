import Papa from "papaparse";
import type { AttendeeRow, ParsedMeta, ParsedReport } from "./types";
import { detectLocale, normalizeDateTime, type SectionKind, type ZoomLocale } from "./locales";
import { normalizeCountry } from "./countries";

const EMPTY_META: ParsedMeta = {
  topic: "",
  webinarId: "",
  actualStartTime: "",
  actualDurationMinutes: "",
  totalUsers: "",
  uniqueViewers: "",
  generatedTime: "",
};

function rowToAttendee(row: string[], headers: string[], loc: ZoomLocale): AttendeeRow {
  const get = (key: string): string => {
    const i = headers.indexOf(key);
    return i >= 0 && i < row.length ? row[i].trim() : "";
  };
  const c = loc.columns;
  const dur = Number(get(c.duration));
  const guest = get(c.isGuest);
  return {
    name: get(c.name),
    email: get(c.email),
    joinTime: normalizeDateTime(get(c.joinTime), loc.dateOrder),
    leaveTime: normalizeDateTime(get(c.leaveTime), loc.dateOrder),
    durationMinutes: Number.isFinite(dur) ? dur : 0,
    isGuest: guest === loc.yes ? "Yes" : guest === loc.no ? "No" : guest,
    country: normalizeCountry(get(c.country), loc.id),
  };
}

function isEmptyRow(row: string[]): boolean {
  return row.every((c) => c.trim() === "");
}

export function parseZoomCsv(text: string): ParsedReport {
  // PapaParse handles quoting / commas-inside-quotes correctly.
  // We strip BOM ourselves so cell-by-cell comparisons are clean.
  const clean = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  const parsed = Papa.parse<string[]>(clean, { skipEmptyLines: false });
  const rows = parsed.data.map((r) => r.map((c) => (c ?? "").trim()));

  const meta: ParsedMeta = { ...EMPTY_META };
  const hosts: AttendeeRow[] = [];
  const panelists: AttendeeRow[] = [];
  const attendees: AttendeeRow[] = [];

  const loc = detectLocale(rows);
  const sectionByTitle = new Map<string, SectionKind>(
    (Object.entries(loc.sections) as [SectionKind, string][]).map(([kind, title]) => [title, kind]),
  );
  const metaByHeader = new Map<string, keyof ParsedMeta>(
    (Object.entries(loc.meta) as [keyof ParsedMeta, string][]).map(([field, header]) => [header, field]),
  );

  let currentSection: SectionKind | null = null;
  let currentHeaders: string[] | null = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (isEmptyRow(row)) continue;
    const first = row[0] ?? "";

    if (first === loc.reportTitle) continue;

    if (first === loc.generatedTime) {
      meta.generatedTime = normalizeDateTime(row[1] ?? "", loc.dateOrder);
      continue;
    }

    if (first === loc.meta.topic) {
      const webinarCols = row;
      let j = i + 1;
      while (j < rows.length && isEmptyRow(rows[j])) j++;
      if (j < rows.length) {
        const valuesRow = rows[j];
        for (let c = 0; c < webinarCols.length; c++) {
          const col = webinarCols[c];
          const value = valuesRow[c] ?? "";
          const field = metaByHeader.get(col);
          if (!field) continue;
          meta[field] = field === "actualStartTime" ? normalizeDateTime(value, loc.dateOrder) : value;
        }
        i = j;
      }
      continue;
    }

    const section = sectionByTitle.get(first);
    if (section) {
      currentSection = section;
      currentHeaders = null;
      let j = i + 1;
      while (j < rows.length && isEmptyRow(rows[j])) j++;
      if (j < rows.length) {
        currentHeaders = rows[j];
        i = j;
      }
      continue;
    }

    if (currentSection && currentHeaders) {
      const att = rowToAttendee(row, currentHeaders, loc);
      if (currentSection === "host") hosts.push(att);
      else if (currentSection === "panelist") panelists.push(att);
      else attendees.push(att);
    }
  }

  return { meta, hosts, panelists, attendees };
}

/** Convenience: parse from an ArrayBuffer (e.g. `await file.arrayBuffer()`). */
export function parseZoomCsvBuffer(buf: ArrayBuffer): ParsedReport {
  return parseZoomCsv(new TextDecoder("utf-8", { fatal: false }).decode(buf));
}
