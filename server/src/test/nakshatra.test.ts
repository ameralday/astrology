import assert from "node:assert";
import { nakshatraOf, rashiOf, normalize360 } from "../ephemeris";
import { PADA_SPAN_DEG } from "../constants/vedic";

function check(label: string, fn: () => void) {
  try {
    fn();
    console.log(`ok - ${label}`);
  } catch (err) {
    console.error(`FAIL - ${label}`);
    throw err;
  }
}

check("0deg is Ashwini pada 1", () => {
  const n = nakshatraOf(0);
  assert.strictEqual(n.nakshatra, "Ashwini");
  assert.strictEqual(n.pada, 1);
});

check("just under 1 pada boundary is still pada 1", () => {
  const n = nakshatraOf(PADA_SPAN_DEG - 0.0001);
  assert.strictEqual(n.nakshatra, "Ashwini");
  assert.strictEqual(n.pada, 1);
});

check("exactly at 1 pada boundary rolls to pada 2", () => {
  const n = nakshatraOf(PADA_SPAN_DEG);
  assert.strictEqual(n.nakshatra, "Ashwini");
  assert.strictEqual(n.pada, 2);
});

check("13deg20' boundary rolls to Bharani pada 1", () => {
  const n = nakshatraOf(13 + 20 / 60);
  assert.strictEqual(n.nakshatra, "Bharani");
  assert.strictEqual(n.pada, 1);
});

check("359.999deg is still Revati pada 4", () => {
  const n = nakshatraOf(359.999);
  assert.strictEqual(n.nakshatra, "Revati");
  assert.strictEqual(n.pada, 4);
});

check("negative longitude normalizes into range", () => {
  assert.strictEqual(normalize360(-10), 350);
  const n = nakshatraOf(-0.0001);
  assert.strictEqual(n.nakshatra, "Revati");
});

check("360deg wraps to Aries 0deg", () => {
  const r = rashiOf(360);
  assert.strictEqual(r.rashi, "Aries");
  assert.strictEqual(r.degreeInSign, 0);
});

check("29.999deg is still Aries, 30deg rolls to Taurus", () => {
  assert.strictEqual(rashiOf(29.999).rashi, "Aries");
  assert.strictEqual(rashiOf(30).rashi, "Taurus");
});

console.log("All nakshatra/rashi boundary tests passed.");
