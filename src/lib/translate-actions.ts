"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireManager } from "@/lib/session";

// MyMemory: a free, keyless public translation API — same "free tier,
// no API key" pattern as the Web Speech API and Esri map tiles used
// elsewhere in this app. Good enough for a demo; a production version
// with real volume would move to a paid provider (DeepL, Google Cloud
// Translation) with an SLA.
const TRANSLATE_URL = "https://api.mymemory.translated.net/get";

export async function translateLog(logId: number): Promise<{ error?: string; text?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "notAuthenticated" };
  await requireManager();

  // Scoped to the caller's farm, so a log id guessed from another farm
  // comes back as "not found" rather than handing over its transcript.
  const log = await prisma.employeeLog.findFirst({
    where: { id: logId, farmId: user.farmId },
  });
  if (!log) return { error: "logNotFound" };

  if (log.translated) return { text: log.translated };

  const sourceLang = log.language.split("-")[0];
  if (sourceLang === "en") return { text: log.transcript };

  try {
    const url = `${TRANSLATE_URL}?q=${encodeURIComponent(log.transcript)}&langpair=${sourceLang}|en`;
    const res = await fetch(url);
    const data = await res.json();
    const text: string | undefined = data?.responseData?.translatedText;
    if (!text) return { error: "translationEmpty" };

    await prisma.employeeLog.updateMany({
      where: { id: logId, farmId: user.farmId },
      data: { translated: text },
    });
    return { text };
  } catch {
    return { error: "translationUnavailable" };
  }
}
