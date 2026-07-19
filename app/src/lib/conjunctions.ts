import { PlanetPlacement } from "../types";
import { joinNatural } from "./format";

/** Other planets sharing the same sign - which, in the whole-sign house system this app uses,
 * also means the same house - as the given planet in this chart. */
export function conjunctPlanets(planet: string, allPlanets: PlanetPlacement[]): PlanetPlacement[] {
  const target = allPlanets.find((p) => p.planet === planet);
  if (!target) return [];
  return allPlanets.filter((p) => p.planet !== planet && p.rashi === target.rashi);
}

/** A standalone clause about conjunctions only, with no placement/house restated - composable
 * into a caller's own sentence when it already covers the planet's sign/house elsewhere (e.g.
 * ChartScreen's Planet modal, which already states this via buildPlacementReading). */
export function conjunctionClause(planet: string, allPlanets: PlanetPlacement[]): string {
  const conjunct = conjunctPlanets(planet, allPlanets);
  if (conjunct.length === 0) {
    return `No other planets are conjunct ${planet} in your chart.`;
  }
  const names = conjunct.map((p) => p.planet);
  const word = names.length > 1 ? "planets" : "planet";
  return `${planet} is conjunct the ${word} ${joinNatural(names)} in your chart.`;
}

/** Full sentence including placement - for callers that don't already state the planet's
 * sign/house elsewhere (e.g. the Home screen's "Day" tap, whose generic planet write-up has no
 * chart-specific placement mentioned anywhere else). */
export function conjunctionSentence(planet: string, allPlanets: PlanetPlacement[]): string | null {
  const target = allPlanets.find((p) => p.planet === planet);
  if (!target) return null;
  return `In your chart, ${planet} is in ${target.rashi} (house ${target.house}). ${conjunctionClause(
    planet,
    allPlanets
  )}`;
}
