"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// MyMemory: a free, keyless public translation API — same "free tier,
// no API key" pattern as the Web Speech API and Esri map tiles used
// elsewhere in this app. Good enough for a demo; a production version
// with real volume would move to a paid provider (DeepL, Google Cloud
// Translation) with an SLA.
const TRANSLATE_URL = "https://api.mymemory.translated.net/get";

export async function translateLog(logId: number): Promise<{ error?: string; text?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "Not authenticated" };

  const log = await prisma.employeeLog.findUnique({ where: { id: logId } });
  if (!log) return { error: "Log not found" };

  if (log.translated) return { text: log.translated };

  const sourceLang = log.language.split("-")[0];
  if (sourceLang === "en") return { text: log.transcript };

  try {
    const url = `${TRANSLATE_URL}?q=${encodeURIComponent(log.transcript)}&langpair=${sourceLang}|en`;
    const res = await fetch(url);
    const data = await res.json();
    const text: string | undefined = data?.responseData?.translatedText;
    if (!text) return { error: "Translation service returned no result." };

    await prisma.employeeLog.update({ where: { id: logId }, data: { translated: text } });
    return { text };
  } catch {
    return { error: "Couldn't reach the translation service. Try again in a moment." };
  }
}
