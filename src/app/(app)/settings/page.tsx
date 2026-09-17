import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your account.</p>
      </div>
      <div className="mt-6 flex flex-col gap-6 sm:flex-row">
        <ProfileForm name={user.name} email={user.email} avatarUrl={user.avatarUrl} />

        <div className="h-fit max-w-sm flex-1 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-medium text-neutral-700">Color Theme</div>
          <p className="mt-1 text-xs text-neutral-500">
            Changes the accent color used on buttons across the app, for this browser only.
          </p>
          <div className="mt-3">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
