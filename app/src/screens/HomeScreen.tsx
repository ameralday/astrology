import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { BirthProfile, Panchang, DayAheadReading, DashaPeriod, PlanetPlacement } from "../types";
import { getProfile, clearProfile } from "../lib/storage";
import { fetchPanchang, fetchWeekAhead } from "../lib/api";
import InfoModal from "../components/InfoModal";
import ScreenBackground from "../components/ScreenBackground";
import { VARA_PLANET } from "../constants/varaInfo";
import { PLANET_INFO } from "../constants/planetInfo";
import { tithiCategoryFor } from "../constants/tithiInfo";
import { KARANA_INFO } from "../constants/karanaInfo";
import { classifyYoga, YOGA_CLASSIFICATION_INFO } from "../constants/yogaInfo";
import {
  findCurrentMahadasha,
  findCurrentAntardasha,
  findCurrentPratyantardasha,
  formatDashaDate,
  mahadashaMeaning,
  antardashaMeaning,
  pratyantardashaMeaning,
} from "../lib/dashaHelpers";
import { conjunctionSentence } from "../lib/conjunctions";

type PanchangElementKey = "day" | "tithi" | "yoga" | "karana" | "nakshatra";

function buildPanchangElementInfo(
  key: PanchangElementKey,
  panchang: Panchang,
  natalPlanets: PlanetPlacement[]
): { title: string; subtitle: string; body: string } | null {
  switch (key) {
    case "day": {
      const planet = VARA_PLANET[panchang.vara];
      const info = planet ? PLANET_INFO[planet] : undefined;
      if (!planet || !info) return null;
      const chartNote = conjunctionSentence(planet, natalPlanets);
      return {
        title: panchang.vara,
        subtitle: `Ruled by ${planet}`,
        body: `Every weekday in Vedic astrology is ruled by a planet. Today's is ${planet}: ${info.significance}${chartNote ? ` ${chartNote}` : ""
          }`,
      };
    }
    case "tithi": {
      const category = tithiCategoryFor(panchang.tithi.number);
      return {
        title: `${panchang.tithi.name} (${panchang.tithi.paksha})`,
        subtitle: category.theme,
        body: category.meaning,
      };
    }
    case "yoga": {
      const classification = classifyYoga(panchang.yoga);
      return {
        title: panchang.yoga,
        subtitle:
          classification === "favorable"
            ? "Favorable"
            : classification === "challenging"
              ? "Challenging"
              : "Best avoided today",
        body: YOGA_CLASSIFICATION_INFO[classification],
      };
    }
    case "karana": {
      const info = KARANA_INFO[panchang.karana];
      if (!info) return null;
      return {
        title: panchang.karana,
        subtitle: info.auspicious ? "Auspicious" : "Traditionally more cautious",
        body: `Karanas are half-tithi periods, each with its own traditional theme. Today's, ${panchang.karana}, is associated with ${info.theme}.`,
      };
    }
    case "nakshatra": {
      const lord = panchang.nakshatra.lord;
      const info = PLANET_INFO[lord];
      if (!info) return null;
      return {
        title: panchang.nakshatra.name,
        subtitle: `Ruled by ${lord}`,
        body: `${panchang.nakshatra.name} is ruled by ${lord}: ${info.significance} This is the same lunar-mansion (nakshatra) system used to compute your Tara Bala reading above and your Dasha periods on the birth chart screen.`,
      };
    }
  }
}

type Props = NativeStackScreenProps<RootStackParamList, "Home">;

/** "Today" expressed as YYYY-MM-DD in the given IANA timezone. */
function todayInTimezone(timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Weekday abbreviation + day-of-month for a "YYYY-MM-DD" string - the weekday of a calendar
 * date doesn't depend on timezone, so this parses the components directly rather than routing
 * through a UTC/zone conversion that could roll over near day boundaries. */
function formatDayChip(dateStr: string): { weekday: string; dayNum: string } {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const weekday = new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  return { weekday, dayNum: String(d) };
}

function formatFullDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(date);
}

/**
 * One-line week synthesis. Leads with Ati Mitra (classically the single most favorable tara)
 * or Vadha (the most cautious) if either occurs this week - those two are well-established
 * standouts in the 9-tara cycle. Otherwise falls back to a simple favorable-day count rather
 * than claiming a fine-grained ranking among the other 7 taras that isn't well established.
 */
function buildWeekSummary(days: DayAheadReading[]): string {
  const bestDay = days.find((d) => d.tara.name === "Ati Mitra");
  const cautionDay = days.find((d) => d.tara.name === "Vadha");
  const chandrashtamaDays = days.filter((d) => d.isChandrashtama);

  let summary: string;
  if (bestDay) {
    summary = `${formatDayChip(bestDay.date).weekday} looks like your best day this week (Ati Mitra).`;
  } else if (cautionDay) {
    summary = `${formatDayChip(cautionDay.date).weekday} is worth extra care this week (Vadha).`;
  } else {
    const favorableCount = days.filter((d) => d.tara.quality === "favorable").length;
    summary = `${favorableCount} of ${days.length} days this week lean favorable for you.`;
  }

  if (chandrashtamaDays.length > 0) {
    const range =
      chandrashtamaDays.length === 1
        ? formatDayChip(chandrashtamaDays[0].date).weekday
        : `${formatDayChip(chandrashtamaDays[0].date).weekday}-${formatDayChip(chandrashtamaDays[chandrashtamaDays.length - 1].date).weekday
        }`;
    summary += ` Chandrashtama falls on ${range}.`;
  }

  return summary;
}

export default function HomeScreen({ navigation }: Props) {
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [panchang, setPanchang] = useState<Panchang | null>(null);
  const [weekAhead, setWeekAhead] = useState<DayAheadReading[] | null>(null);
  const [selectedDay, setSelectedDay] = useState<DayAheadReading | null>(null);
  const [selectedElement, setSelectedElement] = useState<PanchangElementKey | null>(null);
  const [selectedDashaView, setSelectedDashaView] = useState<
    "mahadasha" | "antardasha" | "pratyantardasha" | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      (async () => {
        setLoading(true);
        setError(null);
        const p = await getProfile();
        if (cancelled) return;

        if (!p) {
          navigation.reset({ index: 0, routes: [{ name: "BirthData" }] });
          return;
        }
        setProfile(p);

        try {
          const today = todayInTimezone(p.timezone);
          const natalMoon = p.chart.planets.find((planet) => planet.planet === "Moon");

          const [panchangResult, weekResult] = await Promise.all([
            fetchPanchang({
              date: today,
              timezone: p.timezone,
              lat: p.lat,
              lon: p.lon,
              natalMoonNakshatraIndex: natalMoon?.nakshatraIndex,
              natalMoonRashiIndex: natalMoon?.rashiIndex,
            }),
            natalMoon
              ? fetchWeekAhead({
                startDate: today,
                timezone: p.timezone,
                natalMoonNakshatraIndex: natalMoon.nakshatraIndex,
                natalMoonRashiIndex: natalMoon.rashiIndex,
              })
              : Promise.resolve(null),
          ]);
          if (!cancelled) {
            setPanchang(panchangResult);
            setWeekAhead(weekResult);
          }
        } catch (err) {
          if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't load today's overview");
        } finally {
          if (!cancelled) setLoading(false);
        }
      })();

      return () => {
        cancelled = true;
      };
    }, [navigation])
  );

  async function onClearData() {
    await clearProfile();
    navigation.reset({ index: 0, routes: [{ name: "BirthData" }] });
  }

  if (!profile) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </ScreenBackground>
    );
  }

  const currentMahadasha = findCurrentMahadasha(profile.chart.mahadashas);
  const currentAntardasha = findCurrentAntardasha(currentMahadasha);
  const currentPratyantardasha = findCurrentPratyantardasha(currentAntardasha);

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.greeting}>Hello{profile.name ? `, ${profile.name}` : ""}</Text>
        <Text style={styles.moonLine}>
          Moon in {profile.chart.planets.find((p) => p.planet === "Moon")?.rashi} · Ascendant{" "}
          {profile.chart.ascendant.rashi}
        </Text>

        {panchang?.dailyReading && !loading && (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Your day</Text>
            <View style={styles.taraRow}>
              <Text style={styles.taraName}>{panchang.dailyReading.tara.name}</Text>
              <View style={[styles.qualityBadge, qualityBadgeStyle(panchang.dailyReading.tara.quality)]}>
                <Text style={styles.qualityBadgeText}>{panchang.dailyReading.tara.quality}</Text>
              </View>
            </View>
            <Text style={styles.taraSummary}>{panchang.dailyReading.tara.summary}</Text>
            {panchang.dailyReading.isChandrashtama && (
              <Text style={styles.chandrashtamaWarning}>
                The Moon is also in Chandrashtama for you today (8th from your birth Moon) - a
                traditional sign to move a little more carefully than usual.
              </Text>
            )}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Today's overview</Text>
          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
          {error && <Text style={styles.error}>{error}</Text>}
          {panchang && !loading && (
            <View style={styles.panchangGrid}>
              <PanchangRow label="Day" value={panchang.vara} onPress={() => setSelectedElement("day")} />
              <PanchangRow
                label="Tithi"
                value={`${panchang.tithi.name} (${panchang.tithi.paksha})`}
                onPress={() => setSelectedElement("tithi")}
              />
              <PanchangRow
                label="Nakshatra"
                value={`${panchang.nakshatra.name}, pada ${panchang.nakshatra.pada}`}
                onPress={() => setSelectedElement("nakshatra")}
              />
              <PanchangRow label="Yoga" value={panchang.yoga} onPress={() => setSelectedElement("yoga")} />
              <PanchangRow label="Karana" value={panchang.karana} onPress={() => setSelectedElement("karana")} />
            </View>
          )}
          {panchang && !loading && <Text style={styles.panchangHint}>Tap an item for more information</Text>}
        </View>

        {selectedElement &&
          panchang &&
          (() => {
            const content = buildPanchangElementInfo(selectedElement, panchang, profile.chart.planets);
            if (!content) return null;
            return (
              <InfoModal
                visible={!!selectedElement}
                onClose={() => setSelectedElement(null)}
                title={content.title}
                subtitle={content.subtitle}
              >
                <Text style={styles.infoBody}>{content.body}</Text>
              </InfoModal>
            );
          })()}

        {weekAhead && !loading && (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Week ahead</Text>
            <Text style={styles.weekSummary}>{buildWeekSummary(weekAhead)}</Text>
            <View style={styles.weekRow}>
              {weekAhead.map((day) => {
                const { weekday, dayNum } = formatDayChip(day.date);
                return (
                  <Pressable
                    key={day.date}
                    style={({ pressed }) => [
                      styles.dayChip,
                      qualityBadgeStyle(day.tara.quality),
                      pressed && styles.dayChipPressed,
                    ]}
                    onPress={() => setSelectedDay(day)}
                  >
                    <Text style={styles.dayChipWeekday}>{weekday}</Text>
                    <Text style={styles.dayChipDate}>{dayNum}</Text>
                    {day.isChandrashtama && <View style={styles.dayChipDot} />}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.weekLegend}>
              Green = favorable · Red = unfavorable · Dot = Chandrashtama · Tap a day for more
            </Text>
          </View>
        )}

        {selectedDay && (
          <InfoModal
            visible={!!selectedDay}
            onClose={() => setSelectedDay(null)}
            title={formatFullDate(selectedDay.date)}
            subtitle={selectedDay.tara.name}
          >
            <View style={styles.taraRow}>
              <Text style={styles.taraName}>{selectedDay.tara.name}</Text>
              <View style={[styles.qualityBadge, qualityBadgeStyle(selectedDay.tara.quality)]}>
                <Text style={styles.qualityBadgeText}>{selectedDay.tara.quality}</Text>
              </View>
            </View>
            <Text style={styles.taraSummary}>{selectedDay.tara.summary}</Text>
            {selectedDay.isChandrashtama && (
              <Text style={styles.chandrashtamaWarning}>
                The Moon is also in Chandrashtama for you that day (8th from your birth Moon) - a
                traditional sign to move a little more carefully than usual.
              </Text>
            )}
          </InfoModal>
        )}

        {currentMahadasha && (
          <View style={styles.card}>
            <Text style={styles.cardHeading}>Where you are now</Text>
            <Pressable
              style={({ pressed }) => [styles.dashaRow, pressed && styles.panchangRowPressed]}
              onPress={() => setSelectedDashaView("mahadasha")}
            >
              <Text style={styles.panchangLabel}>Mahadasha</Text>
              <Text style={styles.panchangValue}>
                {currentMahadasha.planet} ({formatDashaDate(currentMahadasha.startDate)} –{" "}
                {formatDashaDate(currentMahadasha.endDate)}) ›
              </Text>
            </Pressable>
            {currentAntardasha && (
              <Pressable
                style={({ pressed }) => [styles.dashaRow, pressed && styles.panchangRowPressed]}
                onPress={() => setSelectedDashaView("antardasha")}
              >
                <Text style={styles.panchangLabel}>Antardasha</Text>
                <Text style={styles.panchangValue}>
                  {currentAntardasha.planet} ({formatDashaDate(currentAntardasha.startDate)} –{" "}
                  {formatDashaDate(currentAntardasha.endDate)}) ›
                </Text>
              </Pressable>
            )}
            {currentPratyantardasha && (
              <Pressable
                style={({ pressed }) => [styles.dashaRow, pressed && styles.panchangRowPressed]}
                onPress={() => setSelectedDashaView("pratyantardasha")}
              >
                <Text style={styles.panchangLabel}>Pratyantardasha</Text>
                <Text style={styles.panchangValue}>
                  {currentPratyantardasha.planet} ({formatDashaDate(currentPratyantardasha.startDate)} –{" "}
                  {formatDashaDate(currentPratyantardasha.endDate)}) ›
                </Text>
              </Pressable>
            )}
            <Text style={styles.panchangHint}>Tap for more information</Text>
          </View>
        )}

        {selectedDashaView &&
          currentMahadasha &&
          (() => {
            if (selectedDashaView === "pratyantardasha" && currentAntardasha && currentPratyantardasha) {
              const meaning = pratyantardashaMeaning(
                currentMahadasha.planet,
                currentAntardasha.planet,
                currentPratyantardasha.planet,
                profile.chart.houses
              );
              if (!meaning) return null;
              return (
                <InfoModal
                  visible
                  onClose={() => setSelectedDashaView(null)}
                  title={`${currentPratyantardasha.planet} Pratyantardasha`}
                  subtitle={`${formatDashaDate(currentPratyantardasha.startDate)} – ${formatDashaDate(
                    currentPratyantardasha.endDate
                  )}`}
                >
                  <Text style={styles.infoBody}>{meaning}</Text>
                </InfoModal>
              );
            }

            if (selectedDashaView === "antardasha" && currentAntardasha) {
              const meaning = antardashaMeaning(
                currentMahadasha.planet,
                currentAntardasha.planet,
                profile.chart.houses
              );
              if (!meaning) return null;
              return (
                <InfoModal
                  visible
                  onClose={() => setSelectedDashaView(null)}
                  title={`${currentAntardasha.planet} Antardasha`}
                  subtitle={`${formatDashaDate(currentAntardasha.startDate)} – ${formatDashaDate(
                    currentAntardasha.endDate
                  )}`}
                >
                  <Text style={styles.infoBody}>{meaning}</Text>
                </InfoModal>
              );
            }

            const meaning = mahadashaMeaning(currentMahadasha.planet, profile.chart.houses);
            if (!meaning) return null;
            return (
              <InfoModal
                visible
                onClose={() => setSelectedDashaView(null)}
                title={`${currentMahadasha.planet} Mahadasha`}
                subtitle={`${formatDashaDate(currentMahadasha.startDate)} – ${formatDashaDate(
                  currentMahadasha.endDate
                )}`}
              >
                <Text style={styles.infoBody}>{meaning}</Text>
              </InfoModal>
            );
          })()}

        <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("Chart")}>
          <Text style={styles.primaryButtonText}>View my full birth chart</Text>
        </Pressable>

        <Pressable style={styles.textButton} onPress={onClearData}>
          <Text style={styles.textButtonLabel}>Clear my saved birth data</Text>
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}

function qualityBadgeStyle(quality: "favorable" | "neutral" | "unfavorable") {
  switch (quality) {
    case "favorable":
      return { backgroundColor: "#e3f4e8" };
    case "unfavorable":
      return { backgroundColor: "#fbe6e6" };
    default:
      return { backgroundColor: "#eee" };
  }
}

function PanchangRow({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  const content = (
    <>
      <Text style={styles.panchangLabel}>{label}</Text>
      <Text style={styles.panchangValue}>
        {value}
        {onPress ? " ›" : ""}
      </Text>
    </>
  );
  if (!onPress) {
    return <View style={styles.panchangRow}>{content}</View>;
  }
  return (
    <Pressable
      style={({ pressed }) => [styles.panchangRow, pressed && styles.panchangRowPressed]}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  greeting: { fontSize: 26, fontWeight: "700" },
  moonLine: { fontSize: 16, color: "#e2ddddff", marginTop: 4, marginBottom: 24 },
  card: { backgroundColor: "#f5effa", borderRadius: 12, padding: 16, marginBottom: 24 },
  cardHeading: { fontSize: 15, fontWeight: "700", color: "#5b2a86" },
  panchangGrid: { marginTop: 10 },
  panchangRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e8def0",
  },
  panchangRowPressed: { opacity: 0.6 },
  panchangLabel: { fontSize: 13, color: "#666" },
  panchangValue: { fontSize: 13, fontWeight: "600" },
  panchangHint: { fontSize: 11, color: "#999", marginTop: 10, textAlign: "center" },
  dashaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e8def0",
  },
  infoBody: { fontSize: 14, color: "#333", lineHeight: 21 },
  error: { color: "#c00", marginTop: 10 },
  weekSummary: { fontSize: 13, color: "#444", marginTop: 8, lineHeight: 19 },
  weekRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  dayChip: {
    width: 40,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  dayChipPressed: { opacity: 0.6 },
  dayChipWeekday: { fontSize: 10, color: "#666", fontWeight: "600" },
  dayChipDate: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  dayChipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#c07f00",
    marginTop: 4,
  },
  weekLegend: { fontSize: 10, color: "#999", marginTop: 10, textAlign: "center" },
  taraRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  taraName: { fontSize: 17, fontWeight: "700" },
  qualityBadge: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  qualityBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  taraSummary: { fontSize: 13, color: "#444", marginTop: 8, lineHeight: 19 },
  chandrashtamaWarning: {
    fontSize: 12,
    color: "#8a5a00",
    marginTop: 10,
    backgroundColor: "#fdf3dd",
    borderRadius: 8,
    padding: 8,
    lineHeight: 17,
  },
  primaryButton: {
    backgroundColor: "#5b2a86",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  textButton: { marginTop: 16, alignItems: "center" },
  textButtonLabel: { color: "#999", fontSize: 13 },
});
