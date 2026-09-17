import { getI18n } from "@/i18n/server";

const FAQS = ["logActivity", "transcription", "flag", "edit"] as const;

export default async function SupportPage() {
  const { t } = await getI18n();

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.pages.support.title}</h1>
        <p className="text-sm text-surface/60">{t.pages.support.subtitle}</p>
      </div>

      <div className="mt-6 max-w-2xl space-y-4">
        {FAQS.map((key) => (
          <div key={key} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-sm font-semibold text-neutral-900">
              {t.pages.support[key].q}
            </div>
            <p className="mt-1.5 text-sm text-neutral-600">{t.pages.support[key].a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
