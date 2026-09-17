"use server";

import { cookies } from "next/headers";
import { isLang, LANG_COOKIE } from "./config";

/** Setting a cookie from a server action makes Next re-render the current
 * route, so the whole page comes back in the new language with no manual
 * refresh. */
export async function setLanguage(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    httpOnly: true,
  });
}
