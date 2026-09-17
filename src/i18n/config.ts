export const LANGS = ["en", "es"] as const;
export type Lang = (typeof LANGS)[number];

/**
 * The chosen language lives in a cookie rather than localStorage so the
 * server can render the right language on the very first response. A
 * localStorage value is only readable after hydration, which means either
 * a flash of English or a server/client mismatch — the same class of bug
 * the theme picker hit.
 */
export const LANG_COOKIE = "toph-lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

/** BCP-47 locale for Intl date/number formatting. */
export function localeFor(lang: Lang) {
  return lang === "es" ? "es-ES" : "en-US";
}
