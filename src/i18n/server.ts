import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { isLang, LANG_COOKIE, type Lang } from "./config";
import { dictionaries } from "./index";

/** The request's language and dictionary, for server components. Cached
 * per request so a page and its layout share one cookie read. */
export const getI18n = cache(async () => {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  const lang: Lang = isLang(value) ? value : "en";
  return { lang, t: dictionaries[lang] };
});
