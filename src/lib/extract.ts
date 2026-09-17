// Pulls the structured fields a compliance record needs out of a spoken
// transcript: which product was applied, what it was targeting, and at
// what rate.
//
// This is a deterministic parser matched against the farm's own approved
// product list, not a language model. That's a deliberate trade: a farm
// can verify exactly why a field was filled in, the same sentence always
// parses the same way, it costs nothing per log, and it works offline.
// The real product uses a model here, which generalises to sentences this
// won't catch — the panel shows every field as editable for that reason.
//
// It has to work on Spanish transcripts too, because the recogniser runs
// in the worker's own language. Brand names survive translation; numbers
// and pest names don't, so both get normalised before matching.
import { APPROVED_PRODUCTS, TARGET_TERMS } from "./products";

export type ExtractedFields = {
  product: string | null;
  target: string | null;
  rate: string | null;
};

const NUMBER_WORDS: Record<string, number> = {
  // English
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, sixty: 60,
  // Spanish
  un: 1, uno: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
  siete: 7, ocho: 8, nueve: 9, diez: 10, once: 11, doce: 12, trece: 13,
  catorce: 14, quince: 15, dieciseis: 16, diecisiete: 17, dieciocho: 18,
  diecinueve: 19, veinte: 20, veintiuno: 21, veintidos: 22, veintitres: 23,
  veinticuatro: 24, veinticinco: 25, veintiseis: 26, veintisiete: 27,
  veintiocho: 28, veintinueve: 29, treinta: 30, cuarenta: 40,
  cincuenta: 50, sesenta: 60,
};

const UNIT_ALIASES: Record<string, string> = {
  oz: "oz", ounce: "oz", ounces: "oz", onza: "oz", onzas: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb", libra: "lb", libras: "lb",
  gal: "gal", gallon: "gal", gallons: "gal", galon: "gal", galones: "gal",
  pt: "pt", pint: "pt", pints: "pt",
  qt: "qt", quart: "qt", quarts: "qt",
  l: "L", liter: "L", liters: "L", litre: "L", litres: "L", litro: "L", litros: "L",
  ml: "mL",
};

const AREA_ALIASES: Record<string, string> = {
  acre: "acre", acres: "acre",
  hectare: "hectare", hectares: "hectare", hectarea: "hectare", hectareas: "hectare",
};

/** Lowercase and strip accents, so "ácaros" and "acaros" match the same term. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

const TENS = ["twenty", "thirty", "forty", "fifty", "sixty"];
const ONES = [
  "one", "two", "three", "four", "five", "six", "seven", "eight", "nine",
];

/**
 * Rewrites spoken numbers as digits so one rate regex handles "24 oz",
 * "twenty-four ounces" and "veinticuatro onzas" alike. Compound English
 * tens are handled before single words, otherwise "twenty four" would
 * come out as "20 4".
 */
export function wordsToDigits(text: string): string {
  let out = text;

  const compound = new RegExp(`\\b(${TENS.join("|")})[\\s-](${ONES.join("|")})\\b`, "g");
  out = out.replace(compound, (_match, tens: string, ones: string) =>
    String(NUMBER_WORDS[tens] + NUMBER_WORDS[ones])
  );

  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    out = out.replace(new RegExp(`\\b${word}\\b`, "g"), String(value));
  }

  return out;
}

function extractProduct(normalized: string): string | null {
  const match = APPROVED_PRODUCTS.find((product) =>
    normalized.includes(normalize(product.name))
  );
  return match ? match.name : null;
}

function extractTarget(normalized: string): string | null {
  for (const [canonical, aliases] of Object.entries(TARGET_TERMS)) {
    if (aliases.some((alias) => normalized.includes(normalize(alias)))) {
      return canonical;
    }
  }
  return null;
}

const UNIT_PATTERN = Object.keys(UNIT_ALIASES)
  // Longest first, so "ounces" isn't partially matched as "oz"'s shorter
  // siblings and "litros" wins over a bare "l".
  .sort((a, b) => b.length - a.length)
  .join("|");
const AREA_PATTERN = Object.keys(AREA_ALIASES)
  .sort((a, b) => b.length - a.length)
  .join("|");

const RATE_PATTERN = new RegExp(
  `(\\d+(?:[.,]\\d+)?)\\s*(${UNIT_PATTERN})\\b\\s*(?:per|por|\\/|a)\\s*(${AREA_PATTERN})\\b`
);

function extractRate(normalized: string): string | null {
  const match = RATE_PATTERN.exec(wordsToDigits(normalized));
  if (!match) return null;

  const [, amount, unit, area] = match;
  return `${amount.replace(",", ".")} ${UNIT_ALIASES[unit]}/${AREA_ALIASES[area]}`;
}

// Stems, not whole words, so "sprayed", "spraying" and "rociamos" all land
// on the same activity. Spanish stems are accent-stripped to match
// `normalize()`.
const ACTIVITY_STEMS: Record<string, string[]> = {
  Spraying: ["spray", "rocia", "rocie", "fumig"],
  Harvesting: ["harvest", "picked", "picking", "cosech", "recolect"],
  Planting: ["planted", "planting", "seeded", "sembr"],
  Irrigation: ["irrigat", "watered", "watering", "rieg", "regamos", "regue"],
  Scouting: ["scout", "inspect", "inspeccion", "revisamos", "revise"],
  Pruning: ["prune", "pruned", "pruning", "podamos", "pode", "podando"],
  "Soil work": ["fertiliz", "tilled", "tilling", "abon", "suelo"],
  "Equipment maintenance": ["repair", "maintenance", "mantenimiento", "repar"],
};

/**
 * Which activity the worker described, by whichever keyword appears first
 * in what they said. The logging screens have the worker pick this from a
 * list; this exists for places where there's only the sentence to go on.
 */
export function extractActivity(transcript: string): string | null {
  const normalized = normalize(transcript);
  let best: { activity: string; index: number } | null = null;

  for (const [activity, stems] of Object.entries(ACTIVITY_STEMS)) {
    for (const stem of stems) {
      const index = normalized.indexOf(stem);
      if (index !== -1 && (!best || index < best.index)) {
        best = { activity, index };
      }
    }
  }
  return best?.activity ?? null;
}

/** "field A", "block C", "campo B" -> "Field A". */
export function extractField(transcript: string): string | null {
  const match = /\b(?:field|block|campo|bloque)\s+([a-d])\b/.exec(normalize(transcript));
  return match ? `Field ${match[1].toUpperCase()}` : null;
}

export function extractLogFields(transcript: string): ExtractedFields {
  const normalized = normalize(transcript);
  return {
    product: extractProduct(normalized),
    target: extractTarget(normalized),
    rate: extractRate(normalized),
  };
}
