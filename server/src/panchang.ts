import { DateTime } from "luxon";
import {
  julianDayUTC,
  normalize360,
  nakshatraOf,
  rashiOf,
  sunLongitude,
  moonLongitude,
} from "./ephemeris";
import { NAKSHATRA_SPAN_DEG, TITHI_NAMES, YOGA_NAMES, KARANA_NAMES, WEEKDAYS_VEDIC, TARAS } from "./constants/vedic";

export interface Panchang {
  vara: string;
  tithi: { number: number; paksha: "Shukla" | "Krishna"; name: string };
  nakshatra: { name: string; lord: string; pada: number };
  yoga: string;
  karana: string;
}

export interface DailyReading {
  tara: { number: number; name: string; quality: "favorable" | "neutral" | "unfavorable"; summary: string };
  isChandrashtama: boolean;
}

export interface NatalMoon {
  nakshatraIndex: number; // 0-26
  rashiIndex: number; // 0-11
}

/**
 * Tara Bala: the classical 9-fold count from a person's natal (janma) nakshatra to today's
 * transiting Moon nakshatra, cycling every 9 nakshatras. Chandrashtama: whether today's Moon
 * sign is the 8th from the natal Moon sign - a well-known "proceed carefully" marker.
 */
export function dailyReadingFor(jd: number, natalMoon: NatalMoon): DailyReading {
  const moonLon = moonLongitude(jd);
  const todayNakshatra = nakshatraOf(moonLon);
  const todayRashi = rashiOf(moonLon);

  const taraNumber = ((todayNakshatra.nakshatraIndex - natalMoon.nakshatraIndex + 27) % 27) + 1;
  const taraCategory = (taraNumber - 1) % 9;
  const tara = TARAS[taraCategory];

  const isChandrashtama = (todayRashi.rashiIndex - natalMoon.rashiIndex + 12) % 12 === 7;

  return { tara: { number: taraCategory + 1, ...tara }, isChandrashtama };
}

export interface DayAheadReading {
  date: string; // "YYYY-MM-DD"
  tara: { number: number; name: string; quality: "favorable" | "neutral" | "unfavorable"; summary: string };
  isChandrashtama: boolean;
}

/**
 * Tara Bala / Chandrashtama for each of `days` consecutive dates starting at `startDate`
 * (inclusive). Used for the Home screen's week-ahead strip, including each day's tap-to-reveal
 * message (same content as the "Your day" card, just for a future date).
 */
export function daysAheadFor(
  startDate: string,
  timezone: string,
  natalMoon: NatalMoon,
  days: number
): DayAheadReading[] {
  const start = DateTime.fromISO(startDate, { zone: timezone });
  const results: DayAheadReading[] = [];

  for (let i = 0; i < days; i++) {
    const date = start.plus({ days: i }).toISODate()!;
    const jd = julianDayUTC(date, "12:00", timezone);
    const { tara, isChandrashtama } = dailyReadingFor(jd, natalMoon);
    results.push({ date, tara, isChandrashtama });
  }

  return results;
}

/**
 * Panchang for local noon on the given date/timezone/location. Noon is a simplification
 * for this prototype - traditional panchang pins tithi/nakshatra to sunrise, which would
 * need a sunrise calculation to do properly.
 */
export function panchangFor(date: string, timezone: string, lat: number, lon: number): Panchang {
  const jd = julianDayUTC(date, "12:00", timezone);

  const sunLon = sunLongitude(jd);
  const moonLon = moonLongitude(jd);
  const diff = normalize360(moonLon - sunLon);

  const tithiNumber = Math.floor(diff / 12) + 1; // 1-30
  const paksha: "Shukla" | "Krishna" = tithiNumber <= 15 ? "Shukla" : "Krishna";
  const tithiInPaksha = tithiNumber <= 15 ? tithiNumber : tithiNumber - 15;
  const tithiName =
    tithiInPaksha === 15
      ? paksha === "Shukla"
        ? "Purnima"
        : "Amavasya"
      : TITHI_NAMES[tithiInPaksha - 1];

  const yogaIndex = Math.floor(normalize360(sunLon + moonLon) / NAKSHATRA_SPAN_DEG);

  const karanaSlot = Math.floor(diff / 6) + 1; // 1-60
  const karana =
    karanaSlot === 1
      ? "Kimstughna"
      : karanaSlot === 58
      ? "Shakuni"
      : karanaSlot === 59
      ? "Chatushpada"
      : karanaSlot === 60
      ? "Naga"
      : KARANA_NAMES[(karanaSlot - 2) % 7];

  const localWeekday = DateTime.fromISO(date, { zone: timezone }).weekday; // Mon=1 ... Sun=7
  const varaIndex = localWeekday % 7; // Sun=0 ... Sat=6, matching WEEKDAYS_VEDIC order

  const moonNakshatra = nakshatraOf(moonLon);

  return {
    vara: WEEKDAYS_VEDIC[varaIndex],
    tithi: { number: tithiNumber, paksha, name: tithiName },
    nakshatra: { name: moonNakshatra.nakshatra, lord: moonNakshatra.lord, pada: moonNakshatra.pada },
    yoga: YOGA_NAMES[yogaIndex],
    karana,
  };
}
