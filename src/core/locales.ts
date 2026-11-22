// Per-locale vocabulary of Zoom's attendee-report CSV. Zoom translates section
// titles, column headers, Yes/No and the country names to the interface
// language of the exporting account. Supporting another language = one more
// entry in LOCALES (plus, if needed, a few country overrides in countries.ts).

export type DateOrder = "mdy" | "dmy";
export type SectionKind = "host" | "panelist" | "attendee";

export interface ZoomLocale {
  /** BCP 47 language tag; also the locale handed to Intl.DisplayNames. */
  id: string;
  /** Order of day/month in slash-separated dates (dotted dates are always DMY). */
  dateOrder: DateOrder;
  reportTitle: string;
  generatedTime: string;
  sections: Record<SectionKind, string>;
  /** Header of the webinar-summary row, by field. */
  meta: {
    topic: string;
    webinarId: string;
    actualStartTime: string;
    actualDurationMinutes: string;
    totalUsers: string;
    uniqueViewers: string;
  };
  /** Header of the attendee tables, by field. */
  columns: {
    name: string;
    email: string;
    joinTime: string;
    leaveTime: string;
    duration: string;
    isGuest: string;
    country: string;
  };
  yes: string;
  no: string;
}

export const ENGLISH: ZoomLocale = {
  id: "en",
  dateOrder: "mdy",
  reportTitle: "Attendee Report",
  generatedTime: "Report generated time",
  sections: { host: "Host Details", panelist: "Panelist Details", attendee: "Attendee Details" },
  meta: {
    topic: "Topic",
    webinarId: "Webinar ID",
    actualStartTime: "Actual Start Time",
    actualDurationMinutes: "Actual Duration (minutes)",
    totalUsers: "Total Users",
    uniqueViewers: "Unique Viewers",
  },
  columns: {
    name: "User Name (Original Name)",
    email: "Email",
    joinTime: "Join Time",
    leaveTime: "Leave Time",
    duration: "Time in Session (minutes)",
    isGuest: "Is Guest",
    country: "Country/Region Name",
  },
  yes: "Yes",
  no: "No",
};

export const RUSSIAN: ZoomLocale = {
  id: "ru",
  dateOrder: "dmy",
  reportTitle: "Отчет об участниках",
  generatedTime: "Время создания отчета",
  sections: {
    host: "Подробнее об организаторе",
    panelist: "Подробности участника группы",
    attendee: "Подробности участников",
  },
  meta: {
    topic: "Тема",
    webinarId: "Идентификатор вебинара",
    actualStartTime: "Фактическое время начала",
    actualDurationMinutes: "Фактическая продолжительность (минуты)",
    totalUsers: "Всего пользователей:",
    uniqueViewers: "Уникальные зрители",
  },
  columns: {
    name: "Имя пользователя (исходное имя)",
    email: "Эл. почта",
    joinTime: "Время входа",
    leaveTime: "Время выхода",
    duration: "Время в сеансе (минут)",
    isGuest: "является гостем",
    country: "Название страны/региона",
  },
  yes: "Да",
  no: "Нет",
};

export const LOCALES: ZoomLocale[] = [ENGLISH, RUSSIAN];

/** Pick the locale whose report title or section titles appear as the first
 *  cell of some row. Defaults to English (also for non-Zoom files). */
export function detectLocale(rows: string[][]): ZoomLocale {
  const firsts = new Set(rows.map((r) => r[0] ?? ""));
  for (const l of LOCALES) {
    if (firsts.has(l.reportTitle) || Object.values(l.sections).some((s) => firsts.has(s))) return l;
  }
  return ENGLISH;
}

function pad(n: number | string): string {
  return String(n).padStart(2, "0");
}

/**
 * Rewrite a localised timestamp into the English export form
 * ("MM/DD/YYYY hh:mm:ss AM"), which the rest of the pipeline understands.
 * Dotted dates are DMY; slashed dates follow the locale's order, but a value
 * that is impossible in that order (e.g. month 22) flips it. Anything that does
 * not look like a date is returned unchanged.
 */
export function normalizeDateTime(s: string, order: DateOrder): string {
  const m = s.trim().match(/^(\d{1,2})([./])(\d{1,2})\2(\d{4})(\s.*)?$/);
  if (!m) return s;
  const a = Number(m[1]);
  const b = Number(m[3]);
  let dmy = m[2] === "." || order === "dmy";
  if (m[2] === "/") {
    if (dmy && b > 12 && a <= 12) dmy = false;
    else if (!dmy && a > 12 && b <= 12) dmy = true;
  }
  const day = dmy ? a : b;
  const month = dmy ? b : a;
  return `${pad(month)}/${pad(day)}/${m[4]}${m[5] ?? ""}`;
}
