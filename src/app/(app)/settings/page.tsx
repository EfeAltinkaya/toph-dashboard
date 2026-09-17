import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/ProfileForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { FarmJoinCode } from "@/components/FarmJoinCode";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const farm = await prisma.farm.findFirst();

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">Settings</h1>
        <p className="text-sm text-surface/60">Manage your account.</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-6">
        <ProfileForm name={user.name} email={user.email} avatarUrl={user.avatarUrl} />
        <ChangePasswordForm />

        <div className="h-fit max-w-sm flex-1 rounded-2xl border border-accent-200 bg-white p-6">
          <div className="text-sm font-medium text-neutral-700">Color Theme</div>
          <p className="mt-1 text-xs text-neutral-500">
            Re-tints the sidebar, cards, and buttons across the whole app, for
            this browser only.
          </p>
          <div className="mt-3">
            <ThemeSwitcher />
          </div>
        </div>

        {farm && <FarmJoinCode farmName={farm.name} joinCode={farm.joinCode} />}
      </div>
    </div>
  );
}
