"use client";

import { createContext, useContext } from "react";
import { dictionaries, type Dictionary } from "./index";
import type { Lang } from "./config";

type I18n = { lang: Lang; t: Dictionary };

const I18nContext = createContext<I18n>({ lang: "en", t: dictionaries.en });

/**
 * Only the language code crosses the server/client boundary; the client
 * looks the dictionary up from its own bundle. Sending the whole
 * dictionary as a prop would re-serialize every string into the page
 * payload on every navigation.
 */
export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <I18nContext value={{ lang, t: dictionaries[lang] }}>{children}</I18nContext>;
}

export function useI18n() {
  return useContext(I18nContext);
}
