// Country names in a non-English Zoom export are normalised to the English
// spelling Zoom itself uses in English exports, so one country is never split
// across languages. Generic path: reverse Intl.DisplayNames (localised name ->
// ISO region code), then code -> Zoom's English spelling. Unknown names pass
// through unchanged.

/** Zoom's English spellings that differ from CLDR's (code -> name as seen in
 *  English exports, e.g. "Hong Kong SAR", "Korea, Republic of"). */
const ZOOM_ENGLISH: Record<string, string> = {
  HK: "Hong Kong SAR",
  MO: "Macau SAR",
  KR: "Korea, Republic of",
  CZ: "Czech Republic",
  LA: "Lao People's Democratic Republic",
  TR: "Turkey",
  US: "United States",
};

/** Localised spellings Zoom uses that Intl.DisplayNames does not produce. */
const LOCALIZED_OVERRIDES: Record<string, Record<string, string>> = {
  ru: {
    "САР Гонконг": "HK",
    "САР Макао": "MO",
    "Соединенные Штаты Америки": "US",
    "Корея, Республика": "KR",
  },
};

const REGION_CODES: string[] = (() => {
  const codes: string[] = [];
  for (let a = 65; a <= 90; a++) {
    for (let b = 65; b <= 90; b++) codes.push(String.fromCharCode(a, b));
  }
  return codes;
})();

const reverseMaps = new Map<string, Map<string, string>>();

function reverseMapFor(locale: string): Map<string, string> {
  let map = reverseMaps.get(locale);
  if (map) return map;
  map = new Map();
  try {
    const dn = new Intl.DisplayNames([locale], { type: "region" });
    for (const code of REGION_CODES) {
      const name = dn.of(code);
      if (name && name !== code) map.set(name.toLowerCase(), code);
    }
  } catch {
    // Intl.DisplayNames unavailable: only the explicit overrides apply.
  }
  for (const [name, code] of Object.entries(LOCALIZED_OVERRIDES[locale] ?? {})) {
    map.set(name.toLowerCase(), code);
  }
  reverseMaps.set(locale, map);
  return map;
}

let english: Intl.DisplayNames | null | undefined;

function englishName(code: string): string | null {
  if (ZOOM_ENGLISH[code]) return ZOOM_ENGLISH[code];
  if (english === undefined) {
    try {
      english = new Intl.DisplayNames(["en"], { type: "region" });
    } catch {
      english = null;
    }
  }
  return english?.of(code) ?? null;
}

export function normalizeCountry(name: string, locale: string): string {
  if (!name || locale === "en") return name;
  const code = reverseMapFor(locale).get(name.trim().toLowerCase());
  return (code && englishName(code)) || name;
}
