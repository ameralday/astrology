import { API_BASE_URL } from "./config";
import { ChartResult, Panchang, DayAheadReading } from "../types";

async function postJSON<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(error ?? `Request to ${path} failed`);
  }
  return res.json() as Promise<T>;
}

export function fetchChart(input: {
  date: string;
  time: string;
  timezone: string;
  lat: number;
  lon: number;
}): Promise<ChartResult> {
  return postJSON<ChartResult>("/api/chart", input);
}

export function fetchPanchang(input: {
  date: string;
  timezone: string;
  lat: number;
  lon: number;
  natalMoonNakshatraIndex?: number;
  natalMoonRashiIndex?: number;
}): Promise<Panchang> {
  return postJSON<Panchang>("/api/panchang", input);
}

export function fetchWeekAhead(input: {
  startDate: string;
  timezone: string;
  natalMoonNakshatraIndex: number;
  natalMoonRashiIndex: number;
  days?: number;
}): Promise<DayAheadReading[]> {
  return postJSON<DayAheadReading[]>("/api/week", input);
}
