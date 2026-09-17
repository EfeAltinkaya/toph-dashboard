"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-neutral-200 py-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-medium text-neutral-900">{question}</span>
        <Plus
          size={18}
          className={`shrink-0 text-neutral-400 transition-transform ${open ? "rotate-45" : ""}`}
        />
      </button>
      {open && <p className="mt-3 max-w-2xl text-sm text-neutral-600">{answer}</p>}
    </div>
  );
}
