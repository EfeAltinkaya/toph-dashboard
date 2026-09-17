import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/ProfileForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { FarmJoinCode } from "@/components/FarmJoinCode";
import { getI18n } from "@/i18n/server";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { t } = await getI18n();
  const farm = await prisma.farm.findUnique({ where: { id: user.farmId } });

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">{t.settings.title}</h1>
        <p className="text-sm text-surface/60">{t.settings.subtitle}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-6">
        <ProfileForm name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
        <ChangePasswordForm />

        <div className="h-fit max-w-sm flex-1 rounded-2xl border border-accent-200 bg-white p-6">
          <div className="text-sm font-medium text-neutral-700">{t.settings.themeTitle}</div>
          <p className="mt-1 text-xs text-neutral-500">{t.settings.themeDescription}</p>
          <div className="mt-3">
            <ThemeSwitcher />
          </div>
        </div>

        {farm && <FarmJoinCode farmName={farm.name} joinCode={farm.joinCode} />}
      </div>
    </div>
  );
}
