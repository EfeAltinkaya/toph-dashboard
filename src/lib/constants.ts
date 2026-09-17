export const ACTIVITIES = [
  "Spraying",
  "Harvesting",
  "Planting",
  "Irrigation",
  "Scouting",
  "Pruning",
  "Soil work",
  "Equipment maintenance",
] as const;

// BCP-47 codes for the Web Speech API's `lang` property (accurate speech
// recognition needs the real spoken language, not just English).
export const LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "es-ES", label: "Spanish" },
] as const;
