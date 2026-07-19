import assert from "node:assert";
import { DateTime } from "luxon";
import { dailyReadingFor, daysAheadFor } from "../panchang";
import { julianDayUTC, moonLongitude, nakshatraOf, rashiOf } from "../ephemeris";

function check(label: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${label}`);
  } catch (err) {
    console.error(`FAIL - ${label}`);
    throw err;
  }
}

const jd = julianDayUTC("2026-07-10", "12:00", "UTC");
const todayNakshatra = nakshatraOf(moonLongitude(jd));
const todayRashi = rashiOf(moonLongitude(jd));

check("same nakshatra as natal is tara 1 (Janma)", () => {
  const reading = dailyReadingFor(jd, {
    nakshatraIndex: todayNakshatra.nakshatraIndex,
    rashiIndex: todayRashi.rashiIndex,
  });
  assert.strictEqual(reading.tara.number, 1);
  assert.strictEqual(reading.tara.name, "Janma");
});

check("natal one nakshatra behind today is tara 2 (Sampat)", () => {
  const natalIndex = (todayNakshatra.nakshatraIndex - 1 + 27) % 27;
  const reading = dailyReadingFor(jd, { nakshatraIndex: natalIndex, rashiIndex: todayRashi.rashiIndex });
  assert.strictEqual(reading.tara.number, 2);
  assert.strictEqual(reading.tara.name, "Sampat");
});

check("tara cycles every 9 nakshatras (28th from natal is tara 1 again)", () => {
  const natalIndex = (todayNakshatra.nakshatraIndex - 27 + 27) % 27; // 27 nakshatras behind = same as 0 behind
  const reading = dailyReadingFor(jd, { nakshatraIndex: natalIndex, rashiIndex: todayRashi.rashiIndex });
  assert.strictEqual(reading.tara.number, 1);
});

check("natal rashi 7 signs behind today's Moon triggers Chandrashtama", () => {
  const natalRashiIndex = (todayRashi.rashiIndex - 7 + 12) % 12;
  const reading = dailyReadingFor(jd, {
    nakshatraIndex: todayNakshatra.nakshatraIndex,
    rashiIndex: natalRashiIndex,
  });
  assert.strictEqual(reading.isChandrashtama, true);
});

check("same rashi as natal is not Chandrashtama", () => {
  const reading = dailyReadingFor(jd, {
    nakshatraIndex: todayNakshatra.nakshatraIndex,
    rashiIndex: todayRashi.rashiIndex,
  });
  assert.strictEqual(reading.isChandrashtama, false);
});

check("daysAheadFor returns the requested number of consecutive calendar days", () => {
  const natal = { nakshatraIndex: todayNakshatra.nakshatraIndex, rashiIndex: todayRashi.rashiIndex };
  const week = daysAheadFor("2026-07-10", "UTC", natal, 7);
  assert.strictEqual(week.length, 7);
  assert.strictEqual(week[0].date, "2026-07-10");
  for (let i = 1; i < week.length; i++) {
    const prev = DateTime.fromISO(week[i - 1].date);
    const curr = DateTime.fromISO(week[i].date);
    assert.strictEqual(curr.diff(prev, "days").days, 1);
  }
});

check("daysAheadFor's first day matches dailyReadingFor for the same date", () => {
  const natal = { nakshatraIndex: todayNakshatra.nakshatraIndex, rashiIndex: todayRashi.rashiIndex };
  const week = daysAheadFor("2026-07-10", "UTC", natal, 3);
  const direct = dailyReadingFor(jd, natal);
  assert.strictEqual(week[0].tara.number, direct.tara.number);
  assert.strictEqual(week[0].isChandrashtama, direct.isChandrashtama);
});

console.log("All daily reading (Tara Bala / Chandrashtama) tests passed.");
