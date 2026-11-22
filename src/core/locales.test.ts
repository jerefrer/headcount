import { describe, expect, it } from "vitest";
import { parseZoomCsv } from "./parser";
import { deduplicate, parseDateTime } from "./processor";
import { aggregate } from "./aggregator";
import { normalizeCountry } from "./countries";
import { normalizeDateTime, LOCALES } from "./locales";
import { RU_WEBINAR_CSV, EN_WEBINAR_CSV } from "./__fixtures__/sample-csvs";

function statsFor(csv: string) {
  const p = parseZoomCsv(csv);
  return aggregate({
    title: "T",
    thresholds: [60],
    days: [{ sources: [{ attendees: deduplicate(p.attendees), meta: p.meta, roomLabel: "Main Room" }] }],
  });
}

describe("Russian Zoom export", () => {
  it("should recognise sections, headers and metadata when the interface is Russian", () => {
    const r = parseZoomCsv(RU_WEBINAR_CSV);
    expect(r.meta.topic).toBe("Тестовый вебинар");
    expect(r.meta.webinarId).toBe("878 2026 0047");
    expect(r.meta.actualDurationMinutes).toBe("187");
    expect(r.meta.totalUsers).toBe("7");
    expect(r.meta.uniqueViewers).toBe("5");
    expect(r.hosts).toHaveLength(1);
    expect(r.panelists).toHaveLength(1);
    expect(r.attendees).toHaveLength(6);
    expect(r.attendees[0].name).toBe("Wei");
    expect(r.attendees[1].durationMinutes).toBe(60);
  });

  it("should parse DD.MM.YYYY dates with 12-hour AM/PM", () => {
    const r = parseZoomCsv(RU_WEBINAR_CSV);
    const d = parseDateTime(r.attendees[3].joinTime)!;
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes()]).toEqual([2026, 10, 22, 11, 5]);
    const pm = parseDateTime(r.attendees[4].joinTime)!;
    expect(pm.getHours()).toBe(12);
  });

  it("should map Да/Нет to Yes/No", () => {
    const r = parseZoomCsv(RU_WEBINAR_CSV);
    expect(r.hosts[0].isGuest).toBe("No");
    expect(r.attendees[0].isGuest).toBe("Yes");
  });

  it("should normalise country names to the English export spellings", () => {
    const r = parseZoomCsv(RU_WEBINAR_CSV);
    expect(r.attendees.map((a) => a.country)).toEqual([
      "China", "China", "Taiwan", "Hong Kong SAR", "United States", "Mongolia",
    ]);
    expect(r.hosts[0].country).toBe("France");
    expect(r.panelists[0].country).toBe("Germany");
  });

  it("should produce the same aggregates as the same data exported in English", () => {
    expect(statsFor(RU_WEBINAR_CSV)).toEqual(statsFor(EN_WEBINAR_CSV));
  });

  it("should leave an unknown country name unchanged", () => {
    expect(normalizeCountry("Атлантида", "ru")).toBe("Атлантида");
  });
});

describe("normalizeCountry", () => {
  it("should apply Zoom's own English spellings where CLDR differs", () => {
    expect(normalizeCountry("Республика Корея", "ru")).toBe("Korea, Republic of");
    expect(normalizeCountry("Чехия", "ru")).toBe("Czech Republic");
    expect(normalizeCountry("Макао (САР)", "ru")).toBe("Macau SAR");
    expect(normalizeCountry("Турция", "ru")).toBe("Turkey");
  });
  it("should return English names unchanged", () => {
    expect(normalizeCountry("Hong Kong SAR", "en")).toBe("Hong Kong SAR");
    expect(normalizeCountry("", "ru")).toBe("");
  });
});

describe("normalizeDateTime", () => {
  it("should convert dotted DMY to the English MM/DD/YYYY form", () => {
    expect(normalizeDateTime("22.11.2026 10:52:20 AM", "dmy")).toBe("11/22/2026 10:52:20 AM");
    expect(normalizeDateTime("03.04.2026 09:00:00 AM", "dmy")).toBe("04/03/2026 09:00:00 AM");
  });
  it("should honour a DMY locale that uses slashes", () => {
    expect(normalizeDateTime("03/04/2026 09:00:00", "dmy")).toBe("04/03/2026 09:00:00");
  });
  it("should fall back on the values when the order is impossible", () => {
    expect(normalizeDateTime("22/11/2026 09:00", "mdy")).toBe("11/22/2026 09:00");
  });
  it("should pass unrecognised strings through", () => {
    expect(normalizeDateTime("n/a", "dmy")).toBe("n/a");
  });
  it("should expose the Russian locale as a data entry", () => {
    expect(LOCALES.some((l) => l.id === "ru")).toBe(true);
  });
});
