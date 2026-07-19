import { DateTime } from "luxon";
import {
  dateToJulianDay,
  calculatePosition,
  calculateHouses,
  setSiderealMode,
  getAyanamsa,
  Planet,
  LunarPoint,
  HouseSystem,
  SiderealMode,
  CalculationFlag,
} from "@swisseph/node";
import { NAKSHATRAS, NAKSHATRA_SPAN_DEG, PADA_SPAN_DEG, RASHIS, PlanetName } from "./constants/vedic";

setSiderealMode(SiderealMode.Lahiri);

const SIDEREAL_MOSHIER_SPEED =
  CalculationFlag.Sidereal | CalculationFlag.MoshierEphemeris | CalculationFlag.Speed;

export function normalize360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** Convert local civil date/time in an IANA timezone to a UT Julian day number. */
export function julianDayUTC(date: string, time: string, timezone: string): number {
  const local = DateTime.fromISO(`${date}T${time}`, { zone: timezone });
  if (!local.isValid) {
    throw new Error(`Invalid date/time/timezone: ${local.invalidExplanation}`);
  }
  const utc = local.toUTC();
  return dateToJulianDay(
    new Date(Date.UTC(utc.year, utc.month - 1, utc.day, utc.hour, utc.minute, utc.second))
  );
}

export interface RashiPlacement {
  rashi: (typeof RASHIS)[number];
  rashiIndex: number; // 0-11
  degreeInSign: number; // 0-30
}

export function rashiOf(siderealLongitude: number): RashiPlacement {
  const lon = normalize360(siderealLongitude);
  const rashiIndex = Math.floor(lon / 30);
  return { rashi: RASHIS[rashiIndex], rashiIndex, degreeInSign: lon - rashiIndex * 30 };
}

export interface NakshatraPlacement {
  nakshatra: string;
  nakshatraIndex: number; // 0-26
  lord: string;
  pada: number; // 1-4
}

export function nakshatraOf(siderealLongitude: number): NakshatraPlacement {
  const lon = normalize360(siderealLongitude);
  const nakshatraIndex = Math.floor(lon / NAKSHATRA_SPAN_DEG);
  const offsetWithinNakshatra = lon - nakshatraIndex * NAKSHATRA_SPAN_DEG;
  const pada = Math.floor(offsetWithinNakshatra / PADA_SPAN_DEG) + 1;
  const { name, lord } = NAKSHATRAS[nakshatraIndex];
  return { nakshatra: name, nakshatraIndex, lord, pada };
}

export interface PlanetPlacement extends RashiPlacement, NakshatraPlacement {
  planet: PlanetName;
  longitude: number; // sidereal, 0-360
  isRetrograde: boolean;
}

const BODY_BY_PLANET: Record<Exclude<PlanetName, "Rahu" | "Ketu">, number> = {
  Sun: Planet.Sun,
  Moon: Planet.Moon,
  Mercury: Planet.Mercury,
  Venus: Planet.Venus,
  Mars: Planet.Mars,
  Jupiter: Planet.Jupiter,
  Saturn: Planet.Saturn,
};

/** Sidereal longitude (and speed) of the Sun, needed by panchang calculations. */
export function sunLongitude(jd: number): number {
  return calculatePosition(jd, Planet.Sun, SIDEREAL_MOSHIER_SPEED).longitude;
}

/** Sidereal longitude (and speed) of the Moon, needed by panchang calculations. */
export function moonLongitude(jd: number): number {
  return calculatePosition(jd, Planet.Moon, SIDEREAL_MOSHIER_SPEED).longitude;
}

export function planetPositions(jd: number): PlanetPlacement[] {
  const placements: PlanetPlacement[] = [];

  for (const [planet, body] of Object.entries(BODY_BY_PLANET) as [
    Exclude<PlanetName, "Rahu" | "Ketu">,
    number
  ][]) {
    const pos = calculatePosition(jd, body, SIDEREAL_MOSHIER_SPEED);
    placements.push({
      planet,
      longitude: normalize360(pos.longitude),
      isRetrograde: planet === "Sun" || planet === "Moon" ? false : pos.longitudeSpeed < 0,
      ...rashiOf(pos.longitude),
      ...nakshatraOf(pos.longitude),
    });
  }

  // Rahu (mean lunar node) is traditionally treated as always-retrograde in Vedic astrology,
  // so it isn't flagged the same way as the true planets. Ketu sits exactly opposite Rahu.
  const rahuPos = calculatePosition(jd, LunarPoint.MeanNode, SIDEREAL_MOSHIER_SPEED);
  const rahuLon = normalize360(rahuPos.longitude);
  const ketuLon = normalize360(rahuLon + 180);

  placements.push({
    planet: "Rahu",
    longitude: rahuLon,
    isRetrograde: true,
    ...rashiOf(rahuLon),
    ...nakshatraOf(rahuLon),
  });
  placements.push({
    planet: "Ketu",
    longitude: ketuLon,
    isRetrograde: true,
    ...rashiOf(ketuLon),
    ...nakshatraOf(ketuLon),
  });

  return placements;
}

/**
 * Sidereal ascendant longitude. calculateHouses() only returns the tropical ascendant
 * (the underlying calculateHouses() call has no sidereal flag), so we derive the sidereal
 * value ourselves by subtracting the ayanamsa - the standard technique for Vedic house
 * calculations with Swiss Ephemeris.
 */
export function siderealAscendant(jd: number, lat: number, lon: number): number {
  const tropicalHouses = calculateHouses(jd, lat, lon, HouseSystem.WholeSign);
  return normalize360(tropicalHouses.ascendant - getAyanamsa(jd));
}

export interface WholeSignHouses {
  ascendant: RashiPlacement;
  /** houses[0] = 1st house's rashi, ... houses[11] = 12th house's rashi */
  houses: (typeof RASHIS)[number][];
}

export function wholeSignHouses(jd: number, lat: number, lon: number): WholeSignHouses {
  const ascendant = rashiOf(siderealAscendant(jd, lat, lon));
  const houses = Array.from(
    { length: 12 },
    (_, i) => RASHIS[(ascendant.rashiIndex + i) % 12]
  );
  return { ascendant, houses };
}
