import CITIES from "../data/cities.json";

export interface PlaceResult {
  label: string;
  lat: number;
  lon: number;
  timezone: string;
}

// [name, region, country, lat, lon, timezone, population]
type CityTuple = [string, string | null, string, number, number, string, number];

const MAX_RESULTS = 8;

function toPlaceResult([name, region, country, lat, lon, timezone]: CityTuple): PlaceResult {
  const label = region ? `${name}, ${region}, ${country}` : `${name}, ${country}`;
  return { label, lat, lon, timezone };
}

/**
 * Offline place search against a bundled GeoNames dataset (cities with population > 15,000 -
 * see scripts/build-cities.js) instead of a live geocoding API. No network call, no rate limit,
 * works without connectivity. Data © GeoNames.org, CC-BY 4.0 (attribution shown on
 * BirthDataScreen). Trade-off: very small towns (population <= 15,000) won't be found.
 */
export async function searchPlaces(query: string): Promise<PlaceResult[]> {
  const q = query.trim().toLowerCase();
  if (q.length < 3) return [];

  const prefixMatches: CityTuple[] = [];
  const substringMatches: CityTuple[] = [];

  for (const city of CITIES as CityTuple[]) {
    const name = city[0].toLowerCase();
    if (name.startsWith(q)) {
      prefixMatches.push(city);
    } else if (name.includes(q)) {
      substringMatches.push(city);
    }
  }

  const byPopulationDesc = (a: CityTuple, b: CityTuple) => b[6] - a[6];
  prefixMatches.sort(byPopulationDesc);
  substringMatches.sort(byPopulationDesc);

  return [...prefixMatches, ...substringMatches].slice(0, MAX_RESULTS).map(toPlaceResult);
}
