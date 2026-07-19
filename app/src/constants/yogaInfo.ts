export type YogaClassification = "favorable" | "challenging" | "mahaDosha";

/**
 * Which of the 27 yogas are traditionally considered inauspicious varies across sources
 * (verified this session - lists disagree, and some published summaries even contradict
 * themselves). Sticking to what's consistently cited: Vyatipata and Vaidhriti are specifically
 * named in classical texts (Brihat Parashara Hora Shastra) as the two to avoid for important
 * undertakings, and Atiganda/Shula/Ganda/Vyaghata come up consistently as more challenging.
 * Everything else defaults to favorable rather than asserting a fine-grained classification
 * that isn't well established.
 */
const CHALLENGING_YOGAS = new Set(["Atiganda", "Shula", "Ganda", "Vyaghata"]);
const MAHA_DOSHA_YOGAS = new Set(["Vyatipata", "Vaidhriti"]);

export function classifyYoga(name: string): YogaClassification {
  if (MAHA_DOSHA_YOGAS.has(name)) return "mahaDosha";
  if (CHALLENGING_YOGAS.has(name)) return "challenging";
  return "favorable";
}

export const YOGA_CLASSIFICATION_INFO: Record<YogaClassification, string> = {
  favorable: "Traditionally considered a generally favorable yoga.",
  challenging: "Traditionally considered a more challenging yoga - worth proceeding with a bit more care today.",
  mahaDosha:
    "One of the two yogas classical texts (Brihat Parashara Hora Shastra) specifically single out as best avoided for important undertakings.",
};
