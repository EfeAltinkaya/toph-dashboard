const FAQS = [
  {
    q: "How do I log a new activity?",
    a: "Click \"New Log\" from the Dashboard or Activity Logs page, pick the employee, activity, and field, then record. Live transcription works in Chrome and Edge.",
  },
  {
    q: "Why don't I see live transcription while recording?",
    a: "Live speech-to-text uses the browser's built-in Web Speech API, which currently only ships in Chrome and Edge. You can still record audio and type the summary manually in any browser.",
  },
  {
    q: "How do I flag a log for review?",
    a: "Open a log, click \"Add Tag,\" and choose \"Needs Review\" or \"Flagged.\" It'll then show up under Audit Manager.",
  },
  {
    q: "Can I edit a log after it's saved?",
    a: "Yes. Click the pencil icon on any row in Activity Logs or the Dashboard to edit it in place.",
  },
];

export default function SupportPage() {
  return (
    <div className="flex-1 p-8">
      <div>
        <h1 className="text-2xl font-semibold text-surface">Support</h1>
        <p className="text-sm text-surface/60">Common questions about Toph.</p>
      </div>

      <div className="mt-6 max-w-2xl space-y-4">
        {FAQS.map((faq) => (
          <div key={faq.q} className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="text-sm font-semibold text-neutral-900">{faq.q}</div>
            <p className="mt-1.5 text-sm text-neutral-600">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
