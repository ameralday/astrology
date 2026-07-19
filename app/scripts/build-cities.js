#!/usr/bin/env node
/**
 * One-off build script: processes raw GeoNames dump files (cities15000.txt,
 * admin1CodesASCII.txt, countryInfo.txt - not committed, downloaded separately into
 * scripts/raw/) into a trimmed, bundled JSON dataset for offline place search.
 *
 * Source: https://download.geonames.org/export/dump/ (CC-BY 4.0 - see BirthDataScreen for
 * the required attribution). Re-run this after re-downloading fresh raw files into
 * scripts/raw/ if the dataset ever needs updating.
 *
 * Output record shape (array-of-tuples to keep the bundle small):
 *   [name, region, country, lat, lon, timezone, population]
 */
const fs = require("fs");
const path = require("path");

const RAW_DIR = path.join(__dirname, "raw");
const OUT_PATH = path.join(__dirname, "..", "src", "data", "cities.json");

function readTsvLines(filename) {
  return fs
    .readFileSync(path.join(RAW_DIR, filename), "utf-8")
    .split("\n")
    .map((line) => line.trimEnd())
    .filter(Boolean);
}

// admin1CodesASCII.txt: "US.MI\tMichigan\tMichigan\t5001836"
const admin1Names = new Map();
for (const line of readTsvLines("admin1CodesASCII.txt")) {
  const [code, name] = line.split("\t");
  admin1Names.set(code, name);
}

// countryInfo.txt: comment lines start with '#'; column 0 = ISO code, column 4 = country name
const countryNames = new Map();
for (const line of readTsvLines("countryInfo.txt")) {
  if (line.startsWith("#")) continue;
  const cols = line.split("\t");
  countryNames.set(cols[0], cols[4]);
}

// cities15000.txt columns (0-indexed after split on tab):
// 0 geonameid, 1 name, 2 asciiname, 3 alternatenames, 4 lat, 5 lon, 6 feature class,
// 7 feature code, 8 country code, 9 cc2, 10 admin1 code, 11 admin2 code, 12 admin3 code,
// 13 admin4 code, 14 population, 15 elevation, 16 dem, 17 timezone, 18 modification date
const cities = [];
for (const line of readTsvLines("cities15000.txt")) {
  const cols = line.split("\t");
  const name = cols[1];
  const lat = parseFloat(cols[4]);
  const lon = parseFloat(cols[5]);
  const countryCode = cols[8];
  const admin1Code = cols[10];
  const population = parseInt(cols[14], 10) || 0;
  const timezone = cols[17];

  const country = countryNames.get(countryCode) ?? countryCode;
  const region = admin1Code ? admin1Names.get(`${countryCode}.${admin1Code}`) : undefined;

  cities.push([name, region ?? null, country, lat, lon, timezone, population]);
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(cities));

console.log(`Wrote ${cities.length} cities to ${path.relative(process.cwd(), OUT_PATH)}`);
