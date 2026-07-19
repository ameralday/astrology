export interface TithiCategoryInfo {
  theme: string;
  meaning: string;
}

/**
 * The 5-fold Nanda/Bhadra/Jaya/Rikta/Purna cycle - consistently described the same way across
 * sources (unlike karana/yoga specifics), repeating every 5 tithis across the 30-tithi month.
 */
export const TITHI_CATEGORIES: TithiCategoryInfo[] = [
  { theme: "Joy", meaning: "A Nanda (\"joy\") tithi - favorable for celebrations and social occasions." },
  { theme: "Prosperity", meaning: "A Bhadra (\"prosperity\") tithi - favorable for travel and learning." },
  { theme: "Victory", meaning: "A Jaya (\"victory\") tithi - favorable for competitive or challenging undertakings." },
  { theme: "Emptiness", meaning: "A Rikta (\"empty\") tithi - traditionally best to avoid starting important new things." },
  { theme: "Fullness", meaning: "A Purna (\"fullness\") tithi - favorable for completing or fulfilling what's already in motion." },
];

/** Tithi number is 1-30; the 5-fold cycle repeats identically across both halves of the month. */
export function tithiCategoryFor(tithiNumber: number): TithiCategoryInfo {
  return TITHI_CATEGORIES[(tithiNumber - 1) % 5];
}
