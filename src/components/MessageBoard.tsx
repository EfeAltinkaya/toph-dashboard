"use client";

import { useRef, useTransition } from "react";
import { Send } from "lucide-react";
import { postMessage } from "@/lib/message-actions";

type MessageRow = { id: number; body: string; createdAt: Date; author: { name: string } };

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function MessageBoard({ messages }: { messages: MessageRow[] }) {
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(formData: FormData) {
    const body = formData.get("body") as string;
    startTransition(async () => {
      await postMessage(body);
      formRef.current?.reset();
    });
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-100 px-4 py-3 text-sm font-semibold text-neutral-900">
        Team Board
      </div>

      <div className="max-h-[50vh] space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <p className="text-sm text-neutral-400">No messages yet. Say hello.</p>
        )}
        {messages.map((m) => (
          <div key={m.id}>
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-neutral-900">{m.author.name}</span>
              <span className="text-xs text-neutral-400">{timeFormatter.format(m.createdAt)}</span>
            </div>
            <p className="mt-0.5 text-sm text-neutral-600">{m.body}</p>
          </div>
        ))}
      </div>

      <form
        ref={formRef}
        action={handleSubmit}
        className="flex items-center gap-2 border-t border-neutral-100 px-4 py-3"
      >
        <input
          name="body"
          required
          placeholder="Post an update to the whole team..."
          className="flex-1 rounded-full border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          <Send size={14} />
        </button>
      </form>
    </div>
  );
}
