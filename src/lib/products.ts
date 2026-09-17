// The farm's approved-product list, with the label facts a compliance
// record needs: what the product is allowed to be applied to, and the
// restricted-entry interval (how long before a worker can re-enter a
// treated block).
//
// This is farm-maintained reference data, entered once — exactly how a
// real compliance tool works, since label data has to be attached to the
// specific products an operation actually buys. In a production build this
// table would sync from the EPA's public product label system rather than
// living in the repo. The values here are illustrative demo data, not a
// substitute for the actual product label.
export type ApprovedProduct = {
  name: string;
  kind: "Fungicide" | "Insecticide" | "Herbicide" | "Fertilizer";
  /**
   * EPA registration number, which is what a filed use report is matched
   * against: a report carrying a number the state doesn't recognise is
   * rejected. Fertilizers aren't pesticides and carry none.
   */
  epaRegNo: string | null;
  /** Labeled targets, lowercase canonical English terms (see TARGET_TERMS). */
  targets: string[];
  /** Restricted-entry interval, in hours. */
  reiHours: number;
};

export const APPROVED_PRODUCTS: ApprovedProduct[] = [
  {
    name: "Serenade ASO",
    kind: "Fungicide",
    epaRegNo: "69592-12",
    targets: ["powdery mildew", "fire blight", "bacterial spot", "aphids"],
    reiHours: 4,
  },
  {
    name: "Regalia",
    kind: "Fungicide",
    epaRegNo: "84059-3",
    targets: ["powdery mildew", "botrytis"],
    reiHours: 4,
  },
  {
    name: "M-Pede",
    kind: "Insecticide",
    epaRegNo: "53219-6",
    targets: ["aphids", "mites", "whiteflies", "thrips"],
    reiHours: 12,
  },
  {
    name: "Entrust SC",
    kind: "Insecticide",
    epaRegNo: "62719-621",
    targets: ["thrips", "worms", "leafminers"],
    reiHours: 4,
  },
  {
    name: "CAN-17",
    kind: "Fertilizer",
    epaRegNo: null,
    targets: [],
    reiHours: 0,
  },
];

// Canonical target term -> the words a worker might actually say for it,
// in English or Spanish. Brand names don't translate, but pests do, so a
// Spanish log saying "pulgones" has to resolve to the same "aphids" the
// English label lists.
export const TARGET_TERMS: Record<string, string[]> = {
  aphids: ["aphids", "aphid", "pulgones", "pulgon"],
  mites: ["mites", "mite", "acaros", "arana roja"],
  thrips: ["thrips", "trips"],
  whiteflies: ["whiteflies", "whitefly", "mosca blanca", "moscas blancas"],
  worms: ["worms", "worm", "gusanos", "gusano"],
  leafminers: ["leafminers", "leafminer", "minadores"],
  "powdery mildew": ["powdery mildew", "mildew", "oidio", "cenicilla", "mildiu"],
  botrytis: ["botrytis", "moho gris"],
  "fire blight": ["fire blight", "fuego bacteriano"],
  "bacterial spot": ["bacterial spot", "mancha bacteriana"],
  weeds: ["weeds", "weed", "malezas", "maleza", "hierba mala"],
};

export function findApprovedProduct(name: string | null | undefined) {
  if (!name) return null;
  const needle = name.trim().toLowerCase();
  return APPROVED_PRODUCTS.find((p) => p.name.toLowerCase() === needle) ?? null;
}
