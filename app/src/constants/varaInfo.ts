/**
 * Vara (weekday) -> ruling planet. This mapping is universally consistent across Vedic
 * astrology sources (unlike karana/yoga specifics) - keyed on the exact vara strings the
 * backend returns (see server/src/constants/vedic.ts WEEKDAYS_VEDIC).
 */
export const VARA_PLANET: Record<string, string> = {
  "Ravivara (Sunday)": "Sun",
  "Somavara (Monday)": "Moon",
  "Mangalavara (Tuesday)": "Mars",
  "Budhavara (Wednesday)": "Mercury",
  "Guruvara (Thursday)": "Jupiter",
  "Shukravara (Friday)": "Venus",
  "Shanivara (Saturday)": "Saturn",
};
