import assert from "node:assert";
import { vimshottariMahadashas, DASHA_ORDER, DASHA_YEARS } from "../dasha";
import { NAKSHATRA_SPAN_DEG } from "../constants/vedic";

function check(label: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${label}`);
  } catch (err) {
    console.error(`FAIL - ${label}`);
    throw err;
  }
}

check("birth at the very start of a nakshatra gives ~full first-dasha balance", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 0.0001, 1);
  assert.strictEqual(result[0].planet, "Ketu"); // Ashwini's lord
  assert.ok(Math.abs(result[0].years - DASHA_YEARS.Ketu) < 0.01);
});

check("birth at the very end of a nakshatra gives ~zero first-dasha balance", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", NAKSHATRA_SPAN_DEG - 0.0001, 1);
  assert.strictEqual(result[0].planet, "Ketu");
  assert.ok(result[0].years < 0.01);
});

check("mahadasha sequence follows DASHA_ORDER starting at the birth nakshatra's lord", () => {
  // Bharani (nakshatra index 1), lord Venus -> DASHA_ORDER index 1.
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", NAKSHATRA_SPAN_DEG + 1, 9);
  result.forEach((m, i) => assert.strictEqual(m.planet, DASHA_ORDER[(1 + i) % 9]));
});

check("mahadashas 2-10 (the full traversal after the partial first) sum to exactly 120 years", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 10);
  const sumOfFullPeriods = result.slice(1).reduce((sum, m) => sum + m.years, 0);
  assert.ok(Math.abs(sumOfFullPeriods - 120) < 0.0001, `expected ~120, got ${sumOfFullPeriods}`);
});

check("antardasha durations within each mahadasha sum to that mahadasha's own duration", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 3);
  for (const m of result) {
    const sumOfAntardashas = m.antardashas.reduce((sum, a) => sum + a.years, 0);
    assert.ok(
      Math.abs(sumOfAntardashas - m.years) < 0.0001,
      `${m.planet} mahadasha: expected antardashas to sum to ${m.years}, got ${sumOfAntardashas}`
    );
  }
});

check("the first mahadasha's antardashas start exactly at birth, not at the natural antardasha boundary", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 1);
  assert.strictEqual(result[0].antardashas[0].startDate, result[0].startDate);
});

check("antardashas after the first mahadasha start fresh at their own natural antardasha #1", () => {
  // A mahadasha that starts at its own natural beginning (every one after the first) should
  // have its first antardasha ruled by the mahadasha's own lord.
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 2);
  assert.strictEqual(result[1].antardashas[0].planet, result[1].planet);
});

check("pratyantardasha durations within each antardasha sum to that antardasha's own duration", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 3);
  for (const m of result) {
    for (const a of m.antardashas) {
      const sumOfPratyantardashas = a.pratyantardashas.reduce((sum, p) => sum + p.years, 0);
      assert.ok(
        Math.abs(sumOfPratyantardashas - a.years) < 0.0001,
        `${m.planet}/${a.planet} antardasha: expected pratyantardashas to sum to ${a.years}, got ${sumOfPratyantardashas}`
      );
    }
  }
});

check("the first antardasha's first pratyantardasha starts exactly at birth", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 1);
  const firstAntardasha = result[0].antardashas[0];
  assert.strictEqual(firstAntardasha.pratyantardashas[0].startDate, firstAntardasha.startDate);
  assert.strictEqual(firstAntardasha.pratyantardashas[0].startDate, result[0].startDate);
});

check("pratyantardashas of a fresh antardasha start with its own lord", () => {
  // The second mahadasha's antardashas are all "fresh" (start at their own natural boundary),
  // so each one's first pratyantardasha should be ruled by that antardasha's own lord.
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 2);
  const antardasha = result[1].antardashas[2]; // an arbitrary fresh antardasha
  assert.strictEqual(antardasha.pratyantardashas[0].planet, antardasha.planet);
});

check("pratyantardashas of a fresh (non-birth) antardasha within the birth mahadasha also start with its own lord", () => {
  // Within the birth mahadasha, every antardasha after the first is itself "fresh" - its
  // pratyantardashas shouldn't be truncated even though the mahadasha itself was.
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 1);
  const secondAntardasha = result[0].antardashas[1];
  assert.strictEqual(secondAntardasha.pratyantardashas[0].planet, secondAntardasha.planet);
  assert.strictEqual(secondAntardasha.pratyantardashas[0].startDate, secondAntardasha.startDate);
});

check("all 9x9 pratyantardashas across a full fresh mahadasha sum to that mahadasha's own duration", () => {
  const result = vimshottariMahadashas("2000-01-01", "12:00", "UTC", 5, 2);
  const freshMahadasha = result[1];
  const total = freshMahadasha.antardashas.reduce(
    (sum, a) => sum + a.pratyantardashas.reduce((s, p) => s + p.years, 0),
    0
  );
  assert.ok(
    Math.abs(total - freshMahadasha.years) < 0.0001,
    `expected all pratyantardashas to sum to ${freshMahadasha.years}, got ${total}`
  );
});

console.log("All Vimshottari dasha tests passed.");
