// Photography for the marketing site, all free under the Unsplash License
// (commercial use allowed, no attribution required — we credit Unsplash in
// the footer anyway). Alt text lives in the i18n dictionaries under
// `photos`, keyed the same way, so it's translated with everything else.
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
  fieldRowsAerial: unsplash("photo-1757170889478-e6768a4e36c1"),
  workersInField: unsplash("photo-1626906722163-bd4c03cb3b9b"),
  workerCarryingFlat: unsplash("photo-1626984232613-f20f15589bee"),
  tractorPlanting: unsplash("photo-1715360378677-d6375ac03dbf"),
  coveredRows: unsplash("photo-1715198901384-0b7ff9f37a77"),
  paddyPlowing: unsplash("photo-1574943320219-553eb213f72d"),
  tendingCrops: unsplash("photo-1509099381441-ea3c0cf98b94"),
} as const;
