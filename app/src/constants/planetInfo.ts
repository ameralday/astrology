export interface PlanetInfo {
  sanskritName: string;
  nature: "Benefic" | "Malefic" | "Neutral";
  significance: string;
  keyPhrase: string;
}

/**
 * General significance of each graha (planet) in Vedic astrology - static reference content,
 * not date/location dependent, so it lives on-device rather than round-tripping to the backend.
 * Scope matches RASHI_INFO: general meaning only, not per-sign combinations (9 x 12 = 108
 * entries) - a much larger future project if it's ever wanted. `keyPhrase` is a short compositional
 * phrase (mirrors HOUSE_INFO's `keywords`) used to build personalized per-house readings.
 */
export const PLANET_INFO: Record<string, PlanetInfo> = {
  Sun: {
    sanskritName: "Surya",
    nature: "Malefic",
    significance:
      "The soul, ego, and vitality. Signifies authority, father figures, and public standing - the king among the grahas, but a natural malefic due to its intense, isolating light.",
    keyPhrase: "vitality, authority, and a sense of purpose",
  },
  Moon: {
    sanskritName: "Chandra",
    nature: "Benefic",
    significance:
      "Governs the mind, emotions, and instinctive reactions. Forms the basis of your Rashi (Moon sign) and Nakshatra in Vedic astrology.",
    keyPhrase: "the mind, emotions, and instinctive reactions",
  },
  Mercury: {
    sanskritName: "Budha",
    nature: "Neutral",
    significance:
      "Intellect, communication, and analytical thinking. Governs how you learn, speak, and do business - takes on the nature of whatever it's closely associated with in a chart.",
    keyPhrase: "intellect, communication, and analytical thinking",
  },
  Venus: {
    sanskritName: "Shukra",
    nature: "Benefic",
    significance:
      "Love, beauty, and relationships. Signifies romance, comfort, artistic sensibility, and what you find pleasurable or worth pursuing.",
    keyPhrase: "love, beauty, and relationships",
  },
  Mars: {
    sanskritName: "Mangala (Kuja)",
    nature: "Malefic",
    significance:
      "Energy, courage, and drive. Represents how you assert yourself and take action - including competition and conflict.",
    keyPhrase: "energy, courage, and drive",
  },
  Jupiter: {
    sanskritName: "Guru (Brihaspati)",
    nature: "Benefic",
    significance:
      "The most benefic graha - wisdom, growth, and good fortune. Signifies teachers, higher learning, optimism, and expansion in whatever area it touches.",
    keyPhrase: "wisdom, growth, and good fortune",
  },
  Saturn: {
    sanskritName: "Shani",
    nature: "Malefic",
    significance:
      "Discipline, responsibility, and karma. Often experienced as delay or restriction, but signifies the patience and hard work that build lasting results.",
    keyPhrase: "discipline, responsibility, and karma",
  },
  Rahu: {
    sanskritName: "Rahu",
    nature: "Malefic",
    significance:
      "A shadow point, not a physical body - the North Lunar Node. Represents worldly desire and ambition, often pulling toward unconventional or unfamiliar territory.",
    keyPhrase: "worldly desire and ambition",
  },
  Ketu: {
    sanskritName: "Ketu",
    nature: "Malefic",
    significance:
      "The other shadow point - the South Lunar Node. Represents detachment, spiritual insight, and unfinished business from the past - areas where you may feel pulled to let go.",
    keyPhrase: "detachment and spiritual insight",
  },
};
