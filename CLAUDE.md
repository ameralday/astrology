# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Vedic astrology mobile app, in early prototype stage. Users enter birth data once, get an
accurate sidereal natal chart, and see a daily panchang-based overview (including a rule-based
"Tara Bala" daily reading) on return visits. Two independent halves that only talk to each other
over HTTP — there is no shared code/types package between them:

- `/server` — stateless Node.js/TypeScript/Express backend that does all the astrological math
  with Swiss Ephemeris. No database; every endpoint is a pure function of its input.
- `/app` — Expo (React Native + TypeScript) client. The user's birth profile is cached only in
  on-device AsyncStorage; nothing is persisted server-side. This statelessness is a deliberate
  product decision, not an oversight — see "doesn't have to save" in project history.

## Commands

**Backend** (`/server`):
```bash
npm install
npm run dev     # tsx watch src/index.ts - starts API on :3000, restarts on file change
npm run build   # tsc -> dist/
npm run start   # node dist/index.js (run build first)
npm test        # runs src/test/nakshatra.test.ts then src/test/dailyReading.test.ts
```
There's no test framework (Jest, etc.) — tests are plain scripts using Node's built-in `assert`,
run directly with `tsx`. To run a single test file: `npx tsx src/test/nakshatra.test.ts`.
No lint script configured. Type-check only: `npx tsc --noEmit`.

**App** (`/app`):
```bash
npm install
npx expo start   # scan the QR code with Expo Go
```
No test suite in the app. Type-check: `npx tsc --noEmit`.

**Running both together**: backend must be up before opening the app (Home/BirthData screens
call it directly, no offline fallback). See root `README.md` for the LAN/firewall setup needed
to reach the backend from a physical phone over Wi-Fi.

## Architecture

### Server: an ephemeris pipeline, not a typical CRUD API

Request flow is `routes/*.ts` (thin HTTP handlers, validation) → `panchang.ts` / directly
`ephemeris.ts` (domain logic) → `ephemeris.ts` (Swiss Ephemeris wrapper via `@swisseph/node`).
`constants/vedic.ts` holds the static reference tables (27 nakshatras, 12 rashis, tithi/yoga/
karana/weekday names, the 9 Tara Bala categories) that the domain logic indexes into.

A few non-obvious decisions baked into `ephemeris.ts` that matter if you touch it:
- Lahiri sidereal mode is set **once, globally**, at module load (`setSiderealMode` call at the
  top of the file) — every position calculated anywhere in the process is sidereal from then on.
- Planet positions use the Moshier analytical model (`CalculationFlag.MoshierEphemeris`), not the
  full JPL data-file mode — no ephemeris files to bundle/deploy, accurate to ~1 arcsecond, which
  is far tighter than the ~3°20' nakshatra-pada boundaries actually need.
- `calculateHouses()` (from `@swisseph/node`) only returns the **tropical** ascendant — there's no
  sidereal flag on it. The sidereal ascendant is derived by subtracting `getAyanamsa(jd)` from
  that tropical value (`siderealAscendant()`). Whole-sign houses are then just the 12 rashis
  counted forward from whichever sign that sidereal ascendant falls in — there's no separate
  house-cusp calculation.
- Rahu/Ketu use the mean lunar node (`LunarPoint.MeanNode`); Ketu is derived as `Rahu + 180°`,
  not calculated independently.
- The panchang "noon" simplification: `panchangFor()` and the daily Tara Bala reading both pin
  their Julian day to local noon on the given date, not sunrise (the traditional reference point
  for panchang). Good enough for a "today" card; would need a sunrise/rise-transit calculation to
  do properly.

`dailyReadingFor()` in `panchang.ts` is the Tara Bala / Chandrashtama logic: it counts nakshatras
from a natal Moon position to today's transiting Moon (cycling every 9), and separately checks
whether today's Moon sign is the 8th from the natal Moon sign. Both are deterministic, rule-based
astrology techniques — this project intentionally avoids LLM-generated interpretation text in
favor of hand-written content keyed off computed values (see `constants/vedic.ts`'s `TARAS` array
and the app's `constants/rashiInfo.ts`), to stay consistent with the "very accurate" product
priority.

### App: local-first, gated navigation

`App.tsx` decides the initial route by checking AsyncStorage for a cached `BirthProfile`
(`src/lib/storage.ts`) before rendering the navigator: no profile → `BirthData` screen, profile
present → `Home`. `BirthDataScreen` is the only place a profile gets created (calls
`POST /api/chart`, then saves the result locally); `HomeScreen` calls `POST /api/panchang` on
every focus, passing the cached profile's natal Moon nakshatra/rashi indices so the backend can
compute that day's Tara Bala reading. `ChartScreen` reads the cached profile directly and does
not call the backend at all.

`src/lib/config.ts` auto-derives the backend's LAN IP from Expo's own dev-server host
(`Constants.expoConfig.hostUri`) rather than hardcoding one — this only works because both the
Expo dev server and the backend run on the same machine during development; it would need a real
config mechanism before a production build.

Geocoding (`src/lib/geocode.ts`) calls OpenStreetMap Nominatim directly from the client (no
backend proxy), and resolves the IANA timezone for a lat/lon fully offline via the bundled
`tz-lookup` package — no network round trip and no API key for that part.

The tap-to-expand info pattern (see `ChartScreen`'s Ascendant card + `components/InfoModal.tsx` +
`constants/rashiInfo.ts`) is meant to be reused for future info panels (planets, houses, etc.):
static reference content lives on-device as plain data, rendered through the same modal
component, with no backend involvement since it isn't date/location-dependent.

## Known environment quirks (this machine, Windows)

- Windows Firewall blocks inbound connections to Node by default when the network profile is
  "Public" — the dev machine's Ethernet connection must be set to "Private" for a phone on the
  same LAN to reach either dev server. See `README.md` for the full troubleshooting path.
- No Watchman installed, so Metro's file-watching is unreliable here — after editing server or
  app source, the dev servers sometimes need a manual restart (kill the process, rerun
  `npm run dev` / `npx expo start`) rather than picking up changes via hot reload.
- The test device's Expo Go client is pinned to SDK 54 — don't bump the `expo` package to a newer
  SDK without first confirming the installed Expo Go client supports it (this caused a full
  SDK 57→54 downgrade once already).
- `npm`'s global cache is deliberately relocated to `D:\Projects\_npm-cache` (see `npm config get
  cache`) because the machine's C: drive has very little free space. Don't move it back.
- `app/AGENTS.md` (pulled in via `app/CLAUDE.md`) currently claims Expo "HAS CHANGED" and points
  at SDK 57 docs — that's stale from the initial scaffold; the project is actually on SDK 54.

## Licensing note

Swiss Ephemeris (and the `@swisseph/node` binding) is AGPL-3.0. The product goal includes
ad-supported commercial use, and AGPL's network-use clause may require publishing the backend's
source unless a commercial license is purchased from Astrodienst. Confirm this before any public
launch — not a blocker for continued prototyping.

## Deferred scope

Auspicious-timing lookahead (muhurta search) is explicitly not built yet.
