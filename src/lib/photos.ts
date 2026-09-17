// Photography for the marketing site, all free under the Unsplash License
// (commercial use allowed, no attribution required — we credit Unsplash in
// the footer anyway).
//
// None of these photos are of Toph users or customers, and the site never
// pairs a face with a quote or a name: this build is fictional, and putting
// a real person's photo next to an invented testimonial would present them
// as endorsing something they've never heard of.

/** Caps the source size fetched from Unsplash before Next resizes it.
 * Must match `images.remotePatterns[0].search` in next.config.ts, or every
 * photo on the site is rejected by the image optimizer. */
export const PHOTO_QUERY = "?auto=format&fit=crop&w=2400&q=80";

function unsplash(id: string) {
  return `https://images.unsplash.com/${id}${PHOTO_QUERY}`;
}

export const PHOTOS = {
  fieldRowsAerial: {
    src: unsplash("photo-1757170889478-e6768a4e36c1"),
    alt: "Aerial view of cultivated farmland planted in long straight rows",
  },
  workersInField: {
    src: unsplash("photo-1626906722163-bd4c03cb3b9b"),
    alt: "Two farmworkers bent over a green field in the early-morning haze",
  },
  workerCarryingFlat: {
    src: unsplash("photo-1626984232613-f20f15589bee"),
    alt: "A farmworker carrying a flat of produce past stacked pallets in a foggy field",
  },
  tractorPlanting: {
    src: unsplash("photo-1715360378677-d6375ac03dbf"),
    alt: "Aerial view of a tractor pulling a planter across dry, dusty farmland",
  },
  coveredRows: {
    src: unsplash("photo-1715198901384-0b7ff9f37a77"),
    alt: "Aerial view of crop rows under protective white covers across several fields",
  },
  paddyPlowing: {
    src: unsplash("photo-1574943320219-553eb213f72d"),
    alt: "A farmer walking oxen beside a tractor in a flooded field, palm trees behind",
  },
  tendingCrops: {
    src: unsplash("photo-1509099381441-ea3c0cf98b94"),
    alt: "A farmer tending crops by hand with palm trees on the hillside behind",
  },
} as const;
