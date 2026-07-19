import { Router } from "express";
import { daysAheadFor } from "../panchang";

const router = Router();

interface WeekRequestBody {
  startDate: string; // "YYYY-MM-DD"
  timezone: string;
  natalMoonNakshatraIndex: number; // 0-26
  natalMoonRashiIndex: number; // 0-11
  days?: number; // defaults to 7
}

function isValidBody(body: any): body is WeekRequestBody {
  return (
    typeof body?.startDate === "string" &&
    typeof body?.timezone === "string" &&
    typeof body?.natalMoonNakshatraIndex === "number" &&
    typeof body?.natalMoonRashiIndex === "number" &&
    (body.days === undefined || typeof body.days === "number")
  );
}

router.post("/", (req, res) => {
  if (!isValidBody(req.body)) {
    res.status(400).json({
      error:
        "Expected { startDate, timezone, natalMoonNakshatraIndex, natalMoonRashiIndex, days? }",
    });
    return;
  }
  const { startDate, timezone, natalMoonNakshatraIndex, natalMoonRashiIndex, days } = req.body;

  try {
    const readings = daysAheadFor(
      startDate,
      timezone,
      { nakshatraIndex: natalMoonNakshatraIndex, rashiIndex: natalMoonRashiIndex },
      days ?? 7
    );
    res.json(readings);
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Invalid input" });
  }
});

export default router;
