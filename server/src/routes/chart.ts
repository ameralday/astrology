import { Router } from "express";
import { julianDayUTC, planetPositions, wholeSignHouses } from "../ephemeris";
import { vimshottariMahadashas } from "../dasha";

const router = Router();

interface ChartRequestBody {
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  timezone: string; // IANA name, e.g. "America/New_York"
  lat: number;
  lon: number;
}

function isValidBody(body: any): body is ChartRequestBody {
  return (
    typeof body?.date === "string" &&
    typeof body?.time === "string" &&
    typeof body?.timezone === "string" &&
    typeof body?.lat === "number" &&
    typeof body?.lon === "number" &&
    body.lat >= -90 &&
    body.lat <= 90 &&
    body.lon >= -180 &&
    body.lon <= 180
  );
}

router.post("/", (req, res) => {
  if (!isValidBody(req.body)) {
    res.status(400).json({ error: "Expected { date, time, timezone, lat, lon }" });
    return;
  }
  const { date, time, timezone, lat, lon } = req.body;

  try {
    const jd = julianDayUTC(date, time, timezone);
    const { ascendant, houses } = wholeSignHouses(jd, lat, lon);
    const planets = planetPositions(jd).map((p) => ({
      ...p,
      house: ((p.rashiIndex - ascendant.rashiIndex + 12) % 12) + 1,
    }));
    const moon = planets.find((p) => p.planet === "Moon")!;
    const mahadashas = vimshottariMahadashas(date, time, timezone, moon.longitude);

    res.json({ ascendant, houses, planets, mahadashas });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid input" });
  }
});

export default router;
