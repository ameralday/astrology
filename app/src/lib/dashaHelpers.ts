import { DashaPeriod } from "../types";
import { PLANET_INFO } from "../constants/planetInfo";
import { ordinal, joinNatural } from "./format";

/** Today as "YYYY-MM-DD" (device-local date - fine for dasha/antardasha periods, which span
 * months to years, unlike the timezone-precise day boundaries panchang calculations need). */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isCurrentPeriod(period: { startDate: string; endDate: string }, now: string = today()): boolean {
  return now >= period.startDate && now < period.endDate;
}

export function findCurrentMahadasha(
  mahadashas: DashaPeriod[],
  now: string = today()
): DashaPeriod | undefined {
  return mahadashas.find((m) => isCurrentPeriod(m, now));
}

export function findCurrentAntardasha(
  mahadasha: DashaPeriod | undefined,
  now: string = today()
): DashaPeriod | undefined {
  return mahadasha?.antardashas?.find((a) => isCurrentPeriod(a, now));
}

export function findCurrentPratyantardasha(
  antardasha: DashaPeriod | undefined,
  now: string = today()
): DashaPeriod | undefined {
  return antardasha?.pratyantardashas?.find((p) => isCurrentPeriod(p, now));
}

export function formatDashaDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

/** Classical sign rulerships - fixed and undisputed, unlike karana/yoga specifics. Rahu/Ketu are
 * shadow points with no classical sign rulership, so they're intentionally omitted. */
const SIGN_RULERSHIP: Record<string, string[]> = {
  Sun: ["Leo"],
  Moon: ["Cancer"],
  Mercury: ["Gemini", "Virgo"],
  Venus: ["Taurus", "Libra"],
  Mars: ["Aries", "Scorpio"],
  Jupiter: ["Sagittarius", "Pisces"],
  Saturn: ["Capricorn", "Aquarius"],
};

/** Which house number(s) a planet rules in this specific chart - houses[0] is the 1st house's
 * rashi, etc. (see wholeSignHouses on the server). */
function housesRuledBy(planet: string, houses: string[]): number[] {
  const ruledSigns = SIGN_RULERSHIP[planet];
  if (!ruledSigns) return [];
  return houses.reduce<number[]>((acc, rashi, i) => {
    if (ruledSigns.includes(rashi)) acc.push(i + 1);
    return acc;
  }, []);
}

function rulershipSentence(planet: string, houses: string[]): string | null {
  const ruled = housesRuledBy(planet, houses);
  if (ruled.length === 0) return null;
  const word = ruled.length > 1 ? "houses" : "house";
  return `${planet} also rules your ${joinNatural(ruled.map(ordinal))} ${word} in this chart.`;
}

export function mahadashaMeaning(planet: string, houses?: string[]): string | null {
  const info = PLANET_INFO[planet];
  if (!info) return null;
  const rulership = houses ? rulershipSentence(planet, houses) : null;
  return `This period of your life is generally colored by ${planet}'s themes: ${info.significance}${
    rulership ? ` ${rulership}` : ""
  }`;
}

export function antardashaMeaning(
  mahadashaPlanet: string,
  antardashaPlanet: string,
  houses?: string[]
): string | null {
  const info = PLANET_INFO[antardashaPlanet];
  if (!info) return null;
  const rulership = houses ? rulershipSentence(antardashaPlanet, houses) : null;
  return `Within your ${mahadashaPlanet} Mahadasha, this ${antardashaPlanet} Antardasha brings an added layer of ${antardashaPlanet}'s themes: ${info.significance}${
    rulership ? ` ${rulership}` : ""
  }`;
}

export function pratyantardashaMeaning(
  mahadashaPlanet: string,
  antardashaPlanet: string,
  pratyantardashaPlanet: string,
  houses?: string[]
): string | null {
  const info = PLANET_INFO[pratyantardashaPlanet];
  if (!info) return null;
  const rulership = houses ? rulershipSentence(pratyantardashaPlanet, houses) : null;
  return `Within your ${mahadashaPlanet} Mahadasha and ${antardashaPlanet} Antardasha, this ${pratyantardashaPlanet} Pratyantardasha brings a further, shorter-term layer of ${pratyantardashaPlanet}'s themes: ${info.significance}${
    rulership ? ` ${rulership}` : ""
  }`;
}
