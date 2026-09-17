"use client";

import { useMemo, useState } from "react";
import { Download, Printer, Check, X } from "lucide-react";
import { FARM } from "@/lib/farm";
import { FIELD_NAMES } from "@/lib/fields";
import {
  auditChecklist,
  recordsToCsv,
  reportSummary,
  type ApplicationRecord,
} from "@/lib/records";
import { farmDayKey, farmMonthKey, FARM_TIME_ZONE } from "@/lib/date-utils";
import { useI18n } from "@/i18n/I18nProvider";
import { format, tr } from "@/i18n";
import { localeFor } from "@/i18n/config";

const TH = "px-2.5 py-2 text-left font-eyebrow text-[10px] tracking-widest uppercase";
const TD = "px-2.5 py-2 align-top";

/**
 * The report a farm has to produce, built from the logs. Everything here is
 * derived: the operator can't type numbers into this document, which is the
 * point — the paperwork and the field record can't disagree, because
 * there's only one of them.
 *
 * Filtering, CSV and printing all happen in the browser against records
 * the server already assembled. Nothing about this document needs a round
 * trip, and an export that goes through an API is an export that can fail
 * while someone is standing in front of an auditor.
 */
export function RecordsReport({ records }: { records: ApplicationRecord[] }) {
  const { lang, t } = useI18n();
  const r = t.records;
  const [period, setPeriod] = useState<string>(() => farmMonthKey(new Date()));
  const [block, setBlock] = useState<string>("");
  const [incompleteOnly, setIncompleteOnly] = useState(false);

  // Only months that actually contain applications are offered: an empty
  // period in the dropdown is a dead end.
  const periods = useMemo(() => {
    const months = Array.from(new Set(records.map((rec) => rec.dateKey.slice(0, 7))));
    return months.sort().reverse();
  }, [records]);

  const filtered = useMemo(
    () =>
      records.filter(
        (rec) =>
          (period === "all" || rec.dateKey.startsWith(period)) &&
          (!block || rec.field === block) &&
          (!incompleteOnly || rec.gaps.length > 0)
      ),
    [records, period, block, incompleteOnly]
  );

  const summary = useMemo(() => reportSummary(filtered), [filtered]);
  const checklist = useMemo(() => auditChecklist(filtered), [filtered]);

  const monthFormatter = new Intl.DateTimeFormat(localeFor(lang), {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
  const dayFormatter = new Intl.DateTimeFormat(localeFor(lang), {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  // Date keys are plain calendar days, already resolved to the farm's zone,
  // so they're formatted as UTC to keep the formatter from shifting them
  // back a day.
  const asUtc = (dateKey: string) => new Date(`${dateKey}T12:00:00Z`);
  const periodLabel =
    period === "all" ? r.allTime : monthFormatter.format(asUtc(`${period}-01`));

  function download() {
    const csv = recordsToCsv(filtered);
    // A Blob and an object URL, because a data: URL of a few hundred rows
    // runs into length limits in some browsers.
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `toph-use-report-${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const scored = checklist.filter((item) => item.applicable > 0);
  const scoreTotal = scored.reduce((sum, item) => sum + item.score, 0);

  return (
    <div className="print-sheet flex-1 p-8">
      <div className="print-hide flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-surface">{r.title}</h1>
          <p className="mt-0.5 max-w-2xl text-sm text-surface/60">{r.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={download}
            className="flex items-center gap-1.5 rounded-full border border-accent-200 bg-white px-3.5 py-2 text-xs font-medium text-neutral-700 hover:bg-accent-25"
          >
            <Download size={14} /> {r.exportCsv}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-2 text-xs font-semibold text-white hover:opacity-90"
          >
            <Printer size={14} /> {r.print}
          </button>
        </div>
      </div>

      {/* Letterhead: only on paper, where the document has to identify
          itself and the operator signing it. */}
      <div className="print-only hidden border-b-2 border-black pb-3">
        <h2 className="text-lg font-bold">{r.doc.title}</h2>
        <div className="mt-1 grid grid-cols-2 gap-x-8 text-[10pt] leading-relaxed">
          <p>
            <strong>{r.doc.operator}:</strong> {FARM.name}
          </p>
          <p>
            <strong>{r.doc.operatorId}:</strong> {FARM.operatorId}
          </p>
          <p>
            <strong>{r.doc.county}:</strong> {FARM.county}
          </p>
          <p>
            <strong>{r.doc.period}:</strong> {periodLabel}
            {block ? ` · ${block}` : ""}
          </p>
        </div>
      </div>

      <div className="print-hide mt-5 flex flex-wrap items-center gap-2">
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          aria-label={r.period}
          className="rounded-xl border border-accent-200 bg-white px-3 py-2 text-sm"
        >
          {periods.map((month) => (
            <option key={month} value={month}>
              {monthFormatter.format(asUtc(`${month}-01`))}
            </option>
          ))}
          <option value="all">{r.allTime}</option>
        </select>
        <select
          value={block}
          onChange={(e) => setBlock(e.target.value)}
          aria-label={r.block}
          className="rounded-xl border border-accent-200 bg-white px-3 py-2 text-sm"
        >
          <option value="">{r.allBlocks}</option>
          {FIELD_NAMES.map((name) => (
            <option key={name} value={name}>
              {tr(t.vocab.fields, name)}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 rounded-xl border border-accent-200 bg-white px-3 py-2 text-sm">
          <input
            type="checkbox"
            checked={incompleteOnly}
            onChange={(e) => setIncompleteOnly(e.target.checked)}
          />
          {r.incompleteOnly}
        </label>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          { label: r.stats.applications, value: String(summary.applications) },
          { label: r.stats.filable, value: String(summary.filable) },
          { label: r.stats.flagged, value: String(summary.flagged) },
          { label: r.stats.acres, value: summary.acresTreated.toLocaleString() },
          { label: r.stats.completeness, value: `${summary.completeness}%` },
        ].map((stat) => (
          <div
            key={stat.label}
            className="print-plain rounded-2xl border border-accent-200 bg-white px-4 py-3"
          >
            <dt className="font-eyebrow text-[10px] tracking-widest text-neutral-500 uppercase">
              {stat.label}
            </dt>
            <dd className="mt-1 text-xl font-semibold text-neutral-900">{stat.value}</dd>
          </div>
        ))}
      </dl>

      {filtered.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-neutral-200 bg-white px-4 py-10 text-center text-sm text-neutral-400">
          {r.empty}
        </p>
      ) : (
        <div className="print-plain mt-5 overflow-x-auto rounded-2xl border border-accent-200 bg-white">
          <table className="w-full min-w-[1100px] border-collapse text-sm">
            <thead className="border-b border-accent-200 bg-accent-25 text-neutral-600">
              <tr>
                <th className={TH}>{r.columns.date}</th>
                <th className={TH}>{r.columns.time}</th>
                <th className={TH}>{r.columns.site}</th>
                <th className={TH}>{r.columns.crop}</th>
                <th className={`${TH} text-right`}>{r.columns.acres}</th>
                <th className={TH}>{r.columns.product}</th>
                <th className={TH}>{r.columns.epa}</th>
                <th className={TH}>{r.columns.rate}</th>
                <th className={TH}>{r.columns.total}</th>
                <th className={TH}>{r.columns.target}</th>
                <th className={TH}>{r.columns.method}</th>
                <th className={`${TH} text-right`}>{r.columns.rei}</th>
                <th className={TH}>{r.columns.applicator}</th>
                <th className={TH}>{r.columns.location}</th>
                <th className={TH}>{r.columns.status}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => (
                <tr key={rec.id} className="border-b border-neutral-100 last:border-0">
                  <td className={`${TD} whitespace-nowrap`}>
                    {dayFormatter.format(asUtc(rec.dateKey))}
                  </td>
                  <td className={`${TD} whitespace-nowrap`}>{rec.startTime}</td>
                  <td className={TD}>
                    <span className="font-medium text-neutral-900">{rec.siteId}</span>
                    <span className="block text-xs text-neutral-500">
                      {tr(t.vocab.fields, rec.field)}
                    </span>
                  </td>
                  <td className={TD}>{rec.crop}</td>
                  <td className={`${TD} text-right tabular-nums`}>{rec.acres}</td>
                  <td className={TD}>
                    <span className="font-medium text-neutral-900">{rec.product}</span>
                    {rec.kind && (
                      <span className="block text-xs text-neutral-500">
                        {tr(t.vocab.productKinds, rec.kind)}
                      </span>
                    )}
                  </td>
                  <td className={`${TD} tabular-nums`}>{rec.epaRegNo ?? "—"}</td>
                  <td className={`${TD} whitespace-nowrap`}>{rec.rate ?? "—"}</td>
                  <td className={`${TD} whitespace-nowrap`}>{rec.totalApplied ?? "—"}</td>
                  <td className={TD}>{rec.target ? tr(t.vocab.targets, rec.target) : "—"}</td>
                  <td className={TD}>{rec.method ? tr(t.vocab.methods, rec.method) : "—"}</td>
                  <td className={`${TD} text-right tabular-nums`}>
                    {rec.reiHours === null ? "—" : format(r.hours, { hours: String(rec.reiHours) })}
                  </td>
                  <td className={TD}>{rec.worker}</td>
                  <td className={`${TD} text-xs`}>
                    {rec.gpsVerified
                      ? format(r.gpsVerified, {
                          meters: String(Math.round(rec.gpsAccuracyM ?? 0)),
                        })
                      : r.blockCoords}
                  </td>
                  <td className={TD}>
                    {rec.gaps.length === 0 ? (
                      <span className="whitespace-nowrap text-xs font-medium text-green-700">
                        {r.complete}
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-red-700">
                        {rec.gaps.map((gap) => r.gaps[gap]).join(" · ")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <section className="print-plain mt-8 rounded-2xl border border-accent-200 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-display text-lg text-neutral-900">{r.checklist.title}</h2>
            <p className="text-sm text-neutral-500">{r.checklist.subtitle}</p>
          </div>
          <p className="text-sm font-medium text-neutral-700">
            {format(r.checklist.total, {
              score: String(scoreTotal),
              total: String(scored.length),
            })}
          </p>
        </div>

        <table className="mt-4 w-full border-collapse text-sm">
          <thead className="border-y border-neutral-300 bg-neutral-50 text-neutral-600">
            <tr>
              <th className={TH}>{r.checklist.item}</th>
              <th className={`${TH} w-24 text-center`}>{r.checklist.score}</th>
              <th className={`${TH} w-1/3`}>{r.checklist.comments}</th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item) => {
              const notApplicable = item.applicable === 0;
              return (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className={TD}>{r.checklist.items[item.id]}</td>
                  <td className={`${TD} text-center`}>
                    {notApplicable ? (
                      <span className="text-neutral-400">—</span>
                    ) : item.score === 1 ? (
                      <span className="inline-flex items-center gap-1 font-medium text-green-700">
                        <Check size={14} /> 1
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-medium text-red-700">
                        <X size={14} /> 0
                      </span>
                    )}
                  </td>
                  <td className={`${TD} text-xs text-neutral-600`}>
                    {notApplicable
                      ? r.checklist.notApplicable
                      : item.score === 1
                        ? format(r.checklist.passing, { count: String(item.applicable) })
                        : format(
                            item.failing.length === 1
                              ? r.checklist.failingOne
                              : r.checklist.failingMany,
                            { ids: item.failing.join(", ") }
                          )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Signature block, print only: an unsigned use report isn't filed. */}
        <div className="print-only mt-10 hidden">
          <div className="grid grid-cols-2 gap-8 text-[10pt]">
            <p className="border-t border-black pt-1">{r.doc.signature}</p>
            <p className="border-t border-black pt-1">{r.doc.date}</p>
          </div>
          <p className="mt-4 text-[8pt] text-neutral-600">
            {format(r.dueNotice, { years: String(FARM.retentionYears) })} {r.doc.footer} (
            {FARM_TIME_ZONE}, {farmDayKey(new Date())})
          </p>
        </div>
      </section>

      <p className="print-hide mt-4 text-xs text-surface/50">
        {format(r.dueNotice, { years: String(FARM.retentionYears) })}
      </p>
    </div>
  );
}
