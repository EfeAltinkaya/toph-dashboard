"use client";

import { useActionState, useState } from "react";
import { Camera } from "lucide-react";
import { updateProfile } from "@/lib/user-actions";
import { resizeImageFile } from "@/lib/image";

export function ProfileForm({
  name,
  email,
  avatarUrl,
}: {
  name: string;
  email: string;
  avatarUrl: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [preview, setPreview] = useState(avatarUrl);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImageFile(file, 256, 0.85);
    setPreview(dataUrl);
  }

  return (
    <form
      action={action}
      className="max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6"
    >
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full bg-neutral-200">
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL, not an optimizable remote image
            <img src={preview} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-lg font-semibold text-neutral-500">
              {name[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <label className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          <Camera size={13} />
          Change Photo
          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </label>
      </div>
      <input type="hidden" name="avatarUrl" value={preview ?? ""} />

      <div>
        <label className="text-sm font-medium text-neutral-700" htmlFor="name">
          Name
        </label>
        <input
          id="name"
          name="name"
          defaultValue={name}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="text-sm font-medium text-neutral-700" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={email}
          className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">Saved.</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        {pending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
