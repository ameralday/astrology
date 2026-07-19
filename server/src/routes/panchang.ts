import { Router } from "express";
import { panchangFor, dailyReadingFor } from "../panchang";
import { julianDayUTC } from "../ephemeris";

const router = Router();

interface PanchangRequestBody {
  date: string; // "YYYY-MM-DD"
  timezone: string;
  lat: number;
  lon: number;
  natalMoonNakshatraIndex?: number; // 0-26, from the user's cached chart - enables the Tara Bala reading
  natalMoonRashiIndex?: number; // 0-11
}

function isValidBody(body: any): body is PanchangRequestBody {
  const hasCore =
    typeof body?.date === "string" &&
    typeof body?.timezone === "string" &&
    typeof body?.lat === "number" &&
    typeof body?.lon === "number";
  if (!hasCore) return false;

  const hasBothNatalFields =
    typeof body.natalMoonNakshatraIndex === "number" && typeof body.natalMoonRashiIndex === "number";
  const hasNeitherNatalField =
    body.natalMoonNakshatraIndex === undefined && body.natalMoonRashiIndex === undefined;
  return hasBothNatalFields || hasNeitherNatalField;
}

router.post("/", (req, res) => {
  if (!isValidBody(req.body)) {
    res.status(400).json({
      error:
        "Expected { date, timezone, lat, lon } and optionally both natalMoonNakshatraIndex and natalMoonRashiIndex",
    });
    return;
  }
  const { date, timezone, lat, lon, natalMoonNakshatraIndex, natalMoonRashiIndex } = req.body;

  try {
    const panchang = panchangFor(date, timezone, lat, lon);

    let dailyReading = undefined;
    if (natalMoonNakshatraIndex !== undefined && natalMoonRashiIndex !== undefined) {
      const jd = julianDayUTC(date, "12:00", timezone);
      dailyReading = dailyReadingFor(jd, {
        nakshatraIndex: natalMoonNakshatraIndex,
        rashiIndex: natalMoonRashiIndex,
      });
    }

    res.json({ ...panchang, dailyReading });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid input" });
  }
});

export default router;
