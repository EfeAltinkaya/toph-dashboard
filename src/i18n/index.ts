import { en, type Dictionary } from "./en";
import { es } from "./es";
import type { Lang } from "./config";
import type { ComplianceCheck } from "@/lib/compliance";

export type { Dictionary };

export const dictionaries: Record<Lang, Dictionary> = { en, es };

export type ErrorKey = keyof Dictionary["errors"];

/** Fills `{name}` placeholders. Unknown placeholders are left visible so a
 * missing param shows up as an obvious bug instead of silently vanishing. */
export function format(template: string, params: Record<string, string | number> = {}) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match
  );
}

/** Translates a stored English vocabulary value (an activity, field, tag...),
 * falling back to the value itself for anything not in the map — e.g. a
 * custom field name a manager typed in. */
export function tr(map: Record<string, string>, value: string) {
  return map[value] ?? value;
}

/** Server actions return error keys; this turns one into a sentence. */
export function errorText(t: Dictionary, key: string | undefined) {
  if (!key) return undefined;
  return (t.errors as Record<string, string>)[key] ?? key;
}

/** A compliance check's label and detail line in the reader's language,
 * with the vocabulary inside its params (field, pest, product type)
 * translated too. */
export function describeCheck(check: ComplianceCheck, t: Dictionary) {
  const params: Record<string, string> = { ...check.params };
  if (params.field) params.field = tr(t.vocab.fields, params.field);
  if (params.target) params.target = tr(t.vocab.targets, params.target);
  if (params.kind) params.kind = tr(t.vocab.productKinds, params.kind);
  return {
    label: t.compliance.labels[check.id],
    detail: format(t.compliance.details[check.detail], params),
  };
}
