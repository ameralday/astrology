import { DateTime } from "luxon";
import { normalize360 } from "./ephemeris";
import { NAKSHATRAS, NAKSHATRA_SPAN_DEG, PlanetName } from "./constants/vedic";

/**
 * Vimshottari Dasha: a fixed 120-year cycle split among the 9 grahas, in a fixed order and
 * fixed proportional durations. The order is the same cycle already encoded in NAKSHATRAS'
 * `lord` field (each nakshatra's ruling planet repeats this 9-planet sequence every 9
 * nakshatras) - so the dasha order is just the first 9 nakshatra lords, not a separate table.
 */
export const DASHA_ORDER: PlanetName[] = NAKSHATRAS.slice(0, 9).map((n) => n.lord) as PlanetName[];

export const DASHA_YEARS: Record<PlanetName, number> = {
  Ketu: 7,
  Venus: 20,
  Sun: 6,
  Moon: 10,
  Mars: 7,
  Rahu: 18,
  Jupiter: 16,
  Saturn: 19,
  Mercury: 17,
};

/** Vedic dasha duration math uses a 365.25-day year for date offsets, not calendar-year
 * arithmetic (which is ambiguous for fractional years) - the standard convention. */
const DAYS_PER_YEAR = 365.25;
const MS_PER_YEAR = DAYS_PER_YEAR * 24 * 60 * 60 * 1000;

export interface DashaPeriod {
  planet: PlanetName;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  years: number;
}

export type Pratyantardasha = DashaPeriod;

export interface Antardasha extends DashaPeriod {
  pratyantardashas: Pratyantardasha[];
}

export interface Mahadasha extends DashaPeriod {
  antardashas: Antardasha[];
}

interface RawPeriod {
  planet: PlanetName;
  start: DateTime;
  end: DateTime;
  years: number;
}

function addYears(start: DateTime, years: number): DateTime {
  return start.plus({ days: years * DAYS_PER_YEAR });
}

function toDashaPeriod(p: RawPeriod): DashaPeriod {
  return { planet: p.planet, startDate: p.start.toISODate()!, endDate: p.end.toISODate()!, years: p.years };
}

/** Lay out a period's 9 sub-periods from its own natural start: same DASHA_ORDER cycle,
 * starting at the period's own lord, each duration proportional to
 * (periodYears * subLordYears) / 120. Correct as-is for any period that starts at its own
 * natural beginning (i.e. every period except the one birth-chain traced in
 * `subPeriodsAtBirthRaw` below). Used at every level - Mahadasha->Antardasha and
 * Antardasha->Pratyantardasha are the exact same math, just applied one level deeper. */
function subdivideRaw(periodStart: DateTime, periodLord: PlanetName, periodYears: number): RawPeriod[] {
  const startIndex = DASHA_ORDER.indexOf(periodLord);
  const subPeriods: RawPeriod[] = [];
  let cursor = periodStart;

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_ORDER[(startIndex + i) % 9];
    const years = (periodYears * DASHA_YEARS[lord]) / 120;
    const end = addYears(cursor, years);
    subPeriods.push({ planet: lord, start: cursor, end, years });
    cursor = end;
  }

  return subPeriods;
}

/**
 * Sub-periods for a period that was itself birth-truncated: lays out the full theoretical
 * sequence from the period's TRUE (untruncated) start, finds which sub-period contains the
 * birth moment, and returns from there onward - that first entry truncated to its own
 * remaining balance, the rest at full duration.
 *
 * This same logic applies at every level along exactly one chain: the first Mahadasha -> its
 * first Antardasha -> its first Pratyantardasha, since a person born partway through a period
 * is also born partway through whichever sub-period (and sub-sub-period) was already active at
 * that exact moment. Every period outside that chain starts at its own natural beginning and
 * uses plain `subdivideRaw` instead.
 */
function subPeriodsAtBirthRaw(
  theoreticalPeriodStart: DateTime,
  periodLord: PlanetName,
  fullPeriodYears: number,
  birth: DateTime
): RawPeriod[] {
  const fullSequence = subdivideRaw(theoreticalPeriodStart, periodLord, fullPeriodYears);
  const currentIndex = fullSequence.findIndex((p) => birth < p.end);
  const fromBirth = fullSequence.slice(currentIndex === -1 ? -1 : currentIndex);

  const first = fromBirth[0];
  fromBirth[0] = {
    ...first,
    start: birth,
    years: (first.end.toMillis() - birth.toMillis()) / MS_PER_YEAR,
  };

  return fromBirth;
}

function pratyantardashasFresh(
  antardashaStart: DateTime,
  antardashaLord: PlanetName,
  antardashaYears: number
): Pratyantardasha[] {
  return subdivideRaw(antardashaStart, antardashaLord, antardashaYears).map(toDashaPeriod);
}

function pratyantardashasAtBirth(
  theoreticalAntardashaStart: DateTime,
  antardashaLord: PlanetName,
  fullAntardashaYears: number,
  birth: DateTime
): Pratyantardasha[] {
  return subPeriodsAtBirthRaw(theoreticalAntardashaStart, antardashaLord, fullAntardashaYears, birth).map(
    toDashaPeriod
  );
}

function antardashasFresh(
  mahadashaStart: DateTime,
  mahadashaLord: PlanetName,
  mahadashaYears: number
): Antardasha[] {
  return subdivideRaw(mahadashaStart, mahadashaLord, mahadashaYears).map((a) => ({
    ...toDashaPeriod(a),
    pratyantardashas: pratyantardashasFresh(a.start, a.planet, a.years),
  }));
}

/**
 * Antardashas for the birth (first, partial) Mahadasha, each with its own Pratyantardasha
 * breakdown. Only the first Antardasha in the returned list (the one active at birth) needs its
 * Pratyantardashas truncated the same way; every Antardasha after it starts at its own natural
 * beginning, so its Pratyantardashas are plain/fresh.
 */
function antardashasAtBirth(
  theoreticalMahadashaStart: DateTime,
  mahadashaLord: PlanetName,
  fullMahadashaYears: number,
  birth: DateTime
): Antardasha[] {
  const raws = subPeriodsAtBirthRaw(theoreticalMahadashaStart, mahadashaLord, fullMahadashaYears, birth);

  return raws.map((a, i) => {
    if (i > 0) {
      return { ...toDashaPeriod(a), pratyantardashas: pratyantardashasFresh(a.start, a.planet, a.years) };
    }

    // This Antardasha is itself birth-truncated. Its end date is unaffected by truncation (only
    // its start/years were adjusted), so its true theoretical start is recoverable as
    // (its own end) - (its full natural duration for its lord) - avoids re-deriving it from
    // scratch.
    const fullYears = DASHA_YEARS[a.planet];
    const theoreticalAntardashaStart = addYears(a.end, -fullYears);
    return {
      planet: a.planet,
      startDate: a.start.toISODate()!,
      endDate: a.end.toISODate()!,
      years: a.years,
      pratyantardashas: pratyantardashasAtBirth(theoreticalAntardashaStart, a.planet, fullYears, birth),
    };
  });
}

/**
 * The Mahadasha sequence for a birth: the first (partial) period at whatever balance remains
 * from the birth nakshatra, followed by `count - 1` full periods continuing the fixed cycle.
 * Each Mahadasha includes its own 9 Antardashas, each of which includes its own 9
 * Pratyantardashas.
 */
export function vimshottariMahadashas(
  date: string,
  time: string,
  timezone: string,
  moonSiderealLongitude: number,
  count = 10
): Mahadasha[] {
  const lon = normalize360(moonSiderealLongitude);
  const nakshatraIndex = Math.floor(lon / NAKSHATRA_SPAN_DEG);
  const offsetWithinNakshatra = lon - nakshatraIndex * NAKSHATRA_SPAN_DEG;
  const fractionElapsed = offsetWithinNakshatra / NAKSHATRA_SPAN_DEG;
  const startingLord = NAKSHATRAS[nakshatraIndex].lord as PlanetName;

  const parsedBirth = DateTime.fromISO(`${date}T${time}`, { zone: timezone });
  if (!parsedBirth.isValid) {
    throw new Error(`Invalid date/time/timezone: ${parsedBirth.invalidExplanation}`);
  }
  const birth = parsedBirth as DateTime;

  const startIndex = DASHA_ORDER.indexOf(startingLord);
  const mahadashas: Mahadasha[] = [];
  let cursor = birth;

  for (let i = 0; i < count; i++) {
    const lord = DASHA_ORDER[(startIndex + i) % 9];
    const fullYears = DASHA_YEARS[lord];
    const years = i === 0 ? fullYears * (1 - fractionElapsed) : fullYears;
    const end = addYears(cursor, years);

    const antardashas =
      i === 0
        ? antardashasAtBirth(addYears(birth, -fullYears * fractionElapsed), lord, fullYears, birth)
        : antardashasFresh(cursor, lord, fullYears);

    mahadashas.push({
      planet: lord,
      startDate: cursor.toISODate()!,
      endDate: end.toISODate()!,
      years,
      antardashas,
    });

    cursor = end;
  }

  return mahadashas;
}
