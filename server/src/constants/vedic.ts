export const RASHIS = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces",
] as const;

export const NAKSHATRAS = [
  { name: "Ashwini", lord: "Ketu" },
  { name: "Bharani", lord: "Venus" },
  { name: "Krittika", lord: "Sun" },
  { name: "Rohini", lord: "Moon" },
  { name: "Mrigashira", lord: "Mars" },
  { name: "Ardra", lord: "Rahu" },
  { name: "Punarvasu", lord: "Jupiter" },
  { name: "Pushya", lord: "Saturn" },
  { name: "Ashlesha", lord: "Mercury" },
  { name: "Magha", lord: "Ketu" },
  { name: "Purva Phalguni", lord: "Venus" },
  { name: "Uttara Phalguni", lord: "Sun" },
  { name: "Hasta", lord: "Moon" },
  { name: "Chitra", lord: "Mars" },
  { name: "Swati", lord: "Rahu" },
  { name: "Vishakha", lord: "Jupiter" },
  { name: "Anuradha", lord: "Saturn" },
  { name: "Jyeshtha", lord: "Mercury" },
  { name: "Mula", lord: "Ketu" },
  { name: "Purva Ashadha", lord: "Venus" },
  { name: "Uttara Ashadha", lord: "Sun" },
  { name: "Shravana", lord: "Moon" },
  { name: "Dhanishta", lord: "Mars" },
  { name: "Shatabhisha", lord: "Rahu" },
  { name: "Purva Bhadrapada", lord: "Jupiter" },
  { name: "Uttara Bhadrapada", lord: "Saturn" },
  { name: "Revati", lord: "Mercury" },
] as const;

/** Each nakshatra spans 13°20' (360 / 27); each of its 4 padas spans 3°20' (13°20' / 4). */
export const NAKSHATRA_SPAN_DEG = 360 / 27;
export const PADA_SPAN_DEG = NAKSHATRA_SPAN_DEG / 4;

export const PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Rahu", "Ketu",
] as const;

export type PlanetName = (typeof PLANETS)[number];

export const WEEKDAYS_VEDIC = [
  "Ravivara (Sunday)", "Somavara (Monday)", "Mangalavara (Tuesday)",
  "Budhavara (Wednesday)", "Guruvara (Thursday)", "Shukravara (Friday)", "Shanivara (Saturday)",
] as const;

export const TITHI_NAMES = [
  "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashthi", "Saptami",
  "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi",
] as const;

export const YOGA_NAMES = [
  "Vishkambha", "Priti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma",
  "Dhriti", "Shula", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
  "Siddhi", "Vyatipata", "Variyana", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha",
  "Shukla", "Brahma", "Indra", "Vaidhriti",
] as const;

export const KARANA_NAMES = [
  "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
] as const;
/** The 4 fixed karanas (Shakuni, Chatushpada, Naga, Kimstughna) occupy the last half-tithi
 * slots (57-60) of the lunar month; the 7 movable karanas above repeat for slots 1-56. */
export const FIXED_KARANA_NAMES = ["Shakuni", "Chatushpada", "Naga", "Kimstughna"] as const;

/**
 * Tara Bala - the classical 9-fold count from a person's natal (janma) nakshatra to
 * today's transiting Moon nakshatra. Counting cycles every 9 nakshatras (27 / 3), giving
 * each day one of these 9 qualities relative to that specific person's birth star.
 */
export const TARAS = [
  {
    name: "Janma",
    quality: "neutral",
    summary: "Today's Moon is back on your birth star. A self-focused day - good for rest and reflection, less ideal for big new launches.",
  },
  {
    name: "Sampat",
    quality: "favorable",
    summary: "A wealth and opportunity star. Favorable for financial matters, purchases, and starting things that need momentum.",
  },
  {
    name: "Vipat",
    quality: "unfavorable",
    summary: "A challenging star. Obstacles are more likely today - avoid risky decisions or important new commitments if you can.",
  },
  {
    name: "Kshema",
    quality: "favorable",
    summary: "A well-being star. Good for health matters, steady progress, and consolidating what you've already started.",
  },
  {
    name: "Pratyak",
    quality: "unfavorable",
    summary: "An obstructive star. Plans may meet friction or delay - patience serves you better than pushing forward today.",
  },
  {
    name: "Sadhaka",
    quality: "favorable",
    summary: "An achievement star. Strong for pursuing goals, negotiations, and anything that benefits from focused effort.",
  },
  {
    name: "Vadha",
    quality: "unfavorable",
    summary: "The most cautious star in the cycle. Best to avoid major decisions, travel, or confrontation today if possible.",
  },
  {
    name: "Mitra",
    quality: "favorable",
    summary: "A friendly star. Favorable for relationships, collaboration, and social plans.",
  },
  {
    name: "Ati Mitra",
    quality: "favorable",
    summary: "The most favorable star in the cycle. A strong day for anything important to you - new beginnings included.",
  },
] as const;
