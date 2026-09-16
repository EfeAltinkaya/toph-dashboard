import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { ProfileForm } from "@/components/ProfileForm";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Settings</h1>
        <p className="text-sm text-neutral-500">Manage your account.</p>
      </div>
      <div className="mt-6">
        <ProfileForm name={user.name} email={user.email} />
      </div>
    </div>
  );
}
