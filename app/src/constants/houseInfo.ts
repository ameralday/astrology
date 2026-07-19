export interface HouseInfo {
  sanskritName: string;
  theme: string;
  keywords: string;
  meaning: string;
}

/**
 * The 12 bhavas (houses) in Vedic astrology - static reference content. `theme`/`keywords` are
 * used to compose a chart-specific reading for a given planet placement (see ChartScreen's
 * placement text); `meaning` is the fuller description shown in the House info modal.
 */
export const HOUSE_INFO: HouseInfo[] = [
  {
    sanskritName: "Tanu Bhava",
    theme: "self and physical presence",
    keywords: "identity, appearance, and how you meet the world",
    meaning:
      "The house of self - your physical body, personality, and how you present yourself to the world. Often considered the most personal house in the chart.",
  },
  {
    sanskritName: "Dhana Bhava",
    theme: "wealth and family",
    keywords: "accumulated resources, values, and speech",
    meaning:
      "The house of accumulated resources and family. Covers wealth, values, speech, and what you consider worth holding onto.",
  },
  {
    sanskritName: "Sahaja Bhava",
    theme: "courage and effort",
    keywords: "siblings, communication, and short journeys",
    meaning:
      "The house of courage and effort. Covers siblings, communication, short journeys, and the confidence to take initiative.",
  },
  {
    sanskritName: "Sukha Bhava",
    theme: "home and emotional foundation",
    keywords: "mother, domestic life, and inner comfort",
    meaning:
      "The house of emotional foundation. Covers home, mother, and the inner comfort you return to.",
  },
  {
    sanskritName: "Putra Bhava",
    theme: "creativity and self-expression",
    keywords: "children, romance, and intelligence",
    meaning:
      "The house of creative self-expression. Covers children, romance, intelligence, and the things you bring into being.",
  },
  {
    sanskritName: "Ripu Bhava",
    theme: "daily work and obstacles",
    keywords: "health, service, and competition",
    meaning:
      "The house of daily work and obstacles. Covers health, service, competition, and the challenges you work to overcome.",
  },
  {
    sanskritName: "Yuvati Bhava",
    theme: "partnerships",
    keywords: "marriage and business relationships",
    meaning:
      "The house of partnership. Covers marriage and close business relationships - anyone you meet as an equal.",
  },
  {
    sanskritName: "Randhra Bhava",
    theme: "transformation",
    keywords: "shared resources, longevity, and the unknown",
    meaning:
      "The house of transformation. Covers shared resources, longevity, and the unknown - often considered the most mysterious house in the chart.",
  },
  {
    sanskritName: "Dharma Bhava",
    theme: "fortune and higher learning",
    keywords: "philosophy, father, and long journeys",
    meaning:
      "The house of fortune and higher learning. Covers philosophy, father, long journeys, and your broader sense of purpose.",
  },
  {
    sanskritName: "Karma Bhava",
    theme: "career and public life",
    keywords: "status, authority, and life direction",
    meaning:
      "The house of public life. Covers career, status, authority, and the direction you take out in the world.",
  },
  {
    sanskritName: "Labha Bhava",
    theme: "gains",
    keywords: "income, community, and aspirations",
    meaning:
      "The house of gains. Covers income, community, friendships, and hopes for the future.",
  },
  {
    sanskritName: "Vyaya Bhava",
    theme: "release",
    keywords: "solitude, spirituality, and foreign lands",
    meaning:
      "The house of release. Covers solitude, spirituality, foreign lands, and letting go.",
  },
];
