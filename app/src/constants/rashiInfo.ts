export interface RashiInfo {
  sanskritName: string;
  symbol: string;
  element: "Fire" | "Earth" | "Air" | "Water";
  modality: "Cardinal" | "Fixed" | "Dual";
  lord: string;
  ascendantMeaning: string;
}

/**
 * Classical Vedic Lagna (ascendant) meanings - static reference content, not
 * date/location dependent, so it lives on-device rather than round-tripping to the backend.
 */
export const RASHI_INFO: Record<string, RashiInfo> = {
  Aries: {
    sanskritName: "Mesha",
    symbol: "Ram",
    element: "Fire",
    modality: "Cardinal",
    lord: "Mars",
    ascendantMeaning:
      "A bold, energetic approach to life. Quick to act and quick to decide, with natural leadership instincts - the growth edge is usually patience.",
  },
  Taurus: {
    sanskritName: "Vrishabha",
    symbol: "Bull",
    element: "Earth",
    modality: "Fixed",
    lord: "Venus",
    ascendantMeaning:
      "A steady, grounded approach to life. Values comfort, security, and beauty, and prefers to move deliberately rather than rush a decision.",
  },
  Gemini: {
    sanskritName: "Mithuna",
    symbol: "Twins",
    element: "Air",
    modality: "Dual",
    lord: "Mercury",
    ascendantMeaning:
      "A curious, communicative approach to life. Quick-witted and adaptable, thriving on variety, conversation, and mental stimulation.",
  },
  Cancer: {
    sanskritName: "Karka",
    symbol: "Crab",
    element: "Water",
    modality: "Cardinal",
    lord: "Moon",
    ascendantMeaning:
      "A nurturing, emotionally attuned approach to life. Protective of home and the people closest to you, with moods that shift with circumstances.",
  },
  Leo: {
    sanskritName: "Simha",
    symbol: "Lion",
    element: "Fire",
    modality: "Fixed",
    lord: "Sun",
    ascendantMeaning:
      "A confident, warm approach to life. A natural presence that enjoys recognition, with a generous, self-assured way of leading.",
  },
  Virgo: {
    sanskritName: "Kanya",
    symbol: "Maiden",
    element: "Earth",
    modality: "Dual",
    lord: "Mercury",
    ascendantMeaning:
      "An analytical, detail-oriented approach to life. Practical and service-minded, holding high standards for yourself and others.",
  },
  Libra: {
    sanskritName: "Tula",
    symbol: "Scales",
    element: "Air",
    modality: "Cardinal",
    lord: "Venus",
    ascendantMeaning:
      "A diplomatic, relationship-focused approach to life. Seeks fairness and balance, often weighing options carefully before deciding.",
  },
  Scorpio: {
    sanskritName: "Vrishchika",
    symbol: "Scorpion",
    element: "Water",
    modality: "Fixed",
    lord: "Mars",
    ascendantMeaning:
      "An intense, private approach to life. Deeply perceptive with strong willpower, and a transformative way of meeting challenges.",
  },
  Sagittarius: {
    sanskritName: "Dhanu",
    symbol: "Archer",
    element: "Fire",
    modality: "Dual",
    lord: "Jupiter",
    ascendantMeaning:
      "An optimistic, freedom-loving approach to life. Philosophical and direct, drawn to learning, exploration, and honesty.",
  },
  Capricorn: {
    sanskritName: "Makara",
    symbol: "Sea-goat",
    element: "Earth",
    modality: "Cardinal",
    lord: "Saturn",
    ascendantMeaning:
      "A disciplined, ambitious approach to life. Patient and responsible, building toward success methodically over time.",
  },
  Aquarius: {
    sanskritName: "Kumbha",
    symbol: "Water-bearer",
    element: "Air",
    modality: "Fixed",
    lord: "Saturn",
    ascendantMeaning:
      "An independent, original approach to life. Drawn to ideas, innovation, and community, sometimes valuing principle over sentiment.",
  },
  Pisces: {
    sanskritName: "Meena",
    symbol: "Fish",
    element: "Water",
    modality: "Dual",
    lord: "Jupiter",
    ascendantMeaning:
      "A compassionate, imaginative approach to life. Empathetic and spiritually inclined, with a growth edge in staying grounded and practical.",
  },
};
