export interface KaranaInfo {
  auspicious: boolean;
  theme: string;
}

/**
 * The 11 karanas (half-tithis). Ruling deity/planet/symbol attributions vary meaningfully
 * across sources (verified this session - several sites directly contradict each other), so
 * this deliberately sticks to what's consistent everywhere: the auspicious/inauspicious
 * classification (the 6 movable karanas Bava-Vanija are auspicious; Vishti plus the 4 fixed
 * karanas are traditionally more cautious) and the general activity theme each is associated
 * with, without asserting contested specifics.
 */
export const KARANA_INFO: Record<string, KaranaInfo> = {
  Bava: { auspicious: true, theme: "general and health-related activities, healing, and rest" },
  Balava: { auspicious: true, theme: "worship, study, and learning-focused activities" },
  Kaulava: { auspicious: true, theme: "relationships, agreements, and partnerships" },
  Taitila: { auspicious: true, theme: "construction and public-works-style projects" },
  Gara: { auspicious: true, theme: "agriculture, groundwork, and building" },
  Vanija: { auspicious: true, theme: "trade, business, and commerce" },
  Vishti: { auspicious: false, theme: "best to avoid important new beginnings" },
  Shakuni: { auspicious: false, theme: "resolving disputes or mediation rather than new ventures" },
  Chatushpada: { auspicious: false, theme: "matters related to animals; not ideal for new ventures" },
  Naga: { auspicious: false, theme: "covert or behind-the-scenes matters; avoid important public activities" },
  Kimstughna: {
    auspicious: false,
    theme: "grouped with the more cautious fixed karanas, though specifically favorable for healing-related matters",
  },
};
