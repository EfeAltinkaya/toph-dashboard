import { divIcon } from "leaflet";

// A pin-shaped marker with a person glyph, so it reads as "a worker is here"
// rather than an abstract dot. Satellite tile imagery is static, historical,
// and far too low-resolution to show an actual person, so this is the
// closest honest stand-in for "see people in the field."
const PERSON_PIN_SVG = `
<svg width="28" height="36" viewBox="0 0 28 36" xmlns="http://www.w3.org/2000/svg">
  <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z" fill="#2563eb" stroke="white" stroke-width="1"/>
  <circle cx="14" cy="14" r="9" fill="white"/>
  <circle cx="14" cy="11" r="3" fill="#2563eb"/>
  <path d="M7 20.5c0-4.5 3-7 7-7s7 2.5 7 7" fill="#2563eb"/>
</svg>`.trim();

export function createPersonPin() {
  return divIcon({
    className: "",
    html: PERSON_PIN_SVG,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -34],
  });
}
