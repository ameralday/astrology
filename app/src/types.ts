export interface RashiPlacement {
  rashi: string;
  rashiIndex: number;
  degreeInSign: number;
}

export interface PlanetPlacement extends RashiPlacement {
  planet: "Sun" | "Moon" | "Mercury" | "Venus" | "Mars" | "Jupiter" | "Saturn" | "Rahu" | "Ketu";
  longitude: number;
  isRetrograde: boolean;
  nakshatra: string;
  nakshatraIndex: number;
  lord: string;
  pada: number;
  house: number;
}

export interface DashaPeriod {
  planet: PlanetPlacement["planet"];
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  years: number;
  antardashas?: DashaPeriod[]; // present on Mahadasha-level entries
  pratyantardashas?: DashaPeriod[]; // present on Antardasha-level entries
}

export interface ChartResult {
  ascendant: RashiPlacement;
  houses: string[];
  planets: PlanetPlacement[];
  mahadashas: DashaPeriod[];
}

export interface DailyReading {
  tara: {
    number: number;
    name: string;
    quality: "favorable" | "neutral" | "unfavorable";
    summary: string;
  };
  isChandrashtama: boolean;
}

export interface Panchang {
  vara: string;
  tithi: { number: number; paksha: "Shukla" | "Krishna"; name: string };
  nakshatra: { name: string; lord: string; pada: number };
  yoga: string;
  karana: string;
  dailyReading?: DailyReading;
}

export interface DayAheadReading extends DailyReading {
  date: string; // "YYYY-MM-DD"
}

export interface BirthProfile {
  name: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:mm"
  timezone: string; // IANA name
  lat: number;
  lon: number;
  placeLabel: string;
  chart: ChartResult;
}
