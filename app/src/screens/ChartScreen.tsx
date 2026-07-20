import React, { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BirthProfile, DashaPeriod } from "../types";
import { getProfile } from "../lib/storage";
import { RASHI_INFO } from "../constants/rashiInfo";
import { PLANET_INFO } from "../constants/planetInfo";
import { HOUSE_INFO } from "../constants/houseInfo";
import InfoModal from "../components/InfoModal";
import ScreenBackground from "../components/ScreenBackground";
import {
  isCurrentPeriod,
  formatDashaDate,
  mahadashaMeaning,
  antardashaMeaning,
  pratyantardashaMeaning,
} from "../lib/dashaHelpers";
import { ordinal, joinNatural } from "../lib/format";
import { conjunctionClause } from "../lib/conjunctions";

function buildHousePersonalMessage(
  houseRashi: string,
  rashiLord: string | undefined,
  planetsHere: { planet: string }[]
): string {
  if (planetsHere.length === 0) {
    return rashiLord
      ? `For you, no planets are currently placed here - this area of your life tends to run on its own, shaped more by ${houseRashi}'s natural qualities (ruled by ${rashiLord}) than by a specific planetary emphasis.`
      : `For you, no planets are currently placed here - this area of your life tends to run on its own rather than being shaped by a specific planetary emphasis.`;
  }
  const phrases = planetsHere.map((p) => `${p.planet} brings ${PLANET_INFO[p.planet]?.keyPhrase ?? "its influence"}`);
  const plural = planetsHere.length > 1;
  return `For you, ${joinNatural(phrases)} directly into this part of life${plural ? " - together" : ""
    }, so expect this house's themes to carry ${plural ? "that combined" : "that"} influence.`;
}

function buildPlacementReading(
  planet: string,
  rashi: string,
  house: number,
  isRetrograde: boolean
): string {
  const houseInfo = HOUSE_INFO[house - 1];
  let reading = `In your chart, ${planet} is in ${rashi} in your ${ordinal(
    house
  )} house - the house of ${houseInfo.theme}. Its themes are most likely to show up through ${houseInfo.keywords}.`;
  if (isRetrograde) {
    reading += ` It's currently retrograde, which traditionally suggests its themes play out in a more internal or reflective way.`;
  }
  return reading;
}

export default function ChartScreen() {
  const [profile, setProfile] = useState<BirthProfile | null>(null);
  const [showAscendantInfo, setShowAscendantInfo] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [selectedMahadasha, setSelectedMahadasha] = useState<DashaPeriod | null>(null);
  const [selectedAntardasha, setSelectedAntardasha] = useState<DashaPeriod | null>(null);
  const [selectedPratyantardasha, setSelectedPratyantardasha] = useState<DashaPeriod | null>(null);

  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  if (!profile) {
    return (
      <ScreenBackground>
        <View style={styles.centered}>
          <ActivityIndicator />
        </View>
      </ScreenBackground>
    );
  }

  const { chart } = profile;
  const ascendantInfo = RASHI_INFO[chart.ascendant.rashi];

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>{profile.name ? `${profile.name}'s birth chart` : "Your birth chart"}</Text>
        <Text style={styles.subtitle}>
          {profile.date} at {profile.time} - {profile.placeLabel}
        </Text>

        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => setShowAscendantInfo(true)}
        >
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardLabel}>Ascendant (Lagna)</Text>
            <Text style={styles.tapHint}>Tap for info ›</Text>
          </View>
          <Text style={styles.cardValue}>
            {chart.ascendant.rashi} {chart.ascendant.degreeInSign.toFixed(1)}°
          </Text>
        </Pressable>

        {ascendantInfo && (
          <InfoModal
            visible={showAscendantInfo}
            onClose={() => setShowAscendantInfo(false)}
            title={`${chart.ascendant.rashi} Ascendant`}
            subtitle={`${ascendantInfo.sanskritName} · ${ascendantInfo.symbol}`}
          >
            <View style={styles.infoFactsRow}>
              <InfoFact label="Element" value={ascendantInfo.element} />
              <InfoFact label="Modality" value={ascendantInfo.modality} />
              <InfoFact label="Lord" value={ascendantInfo.lord} />
            </View>
            <Text style={styles.infoBody}>{ascendantInfo.ascendantMeaning}</Text>
          </InfoModal>
        )}

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Planets</Text>
          <View style={styles.table}>
            <View style={[styles.row, styles.headerRow]}>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.1 }]}>Planet</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.3 }]}>Sign</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 1.6 }]}>Nakshatra</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>Pada</Text>
              <Text style={[styles.cell, styles.headerCell, { flex: 0.6 }]}>House</Text>
            </View>
            {chart.planets.map((p) => (
              <Pressable
                key={p.planet}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => setSelectedPlanet(p.planet)}
              >
                <Text style={[styles.cell, { flex: 1.1 }]}>
                  {p.planet}
                  {p.isRetrograde ? " (R)" : ""}
                </Text>
                <Text style={[styles.cell, { flex: 1.3 }]}>
                  {p.rashi} {p.degreeInSign.toFixed(1)}°
                </Text>
                <Text style={[styles.cell, { flex: 1.6 }]}>{p.nakshatra}</Text>
                <Text style={[styles.cell, { flex: 0.6 }]}>{p.pada}</Text>
                <Text style={[styles.cell, { flex: 0.6 }]}>{p.house}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.tableHint}>Tap a planet for more information</Text>
        </View>

        {selectedPlanet &&
          (() => {
            const planetData = chart.planets.find((p) => p.planet === selectedPlanet);
            const planetInfo = PLANET_INFO[selectedPlanet];
            if (!planetData || !planetInfo) return null;
            return (
              <InfoModal
                visible={!!selectedPlanet}
                onClose={() => setSelectedPlanet(null)}
                title={selectedPlanet}
                subtitle={`${planetInfo.sanskritName} · ${planetData.rashi}, house ${planetData.house}`}
              >
                <View style={styles.infoFactsRow}>
                  <InfoFact label="Nature" value={planetInfo.nature} />
                  <InfoFact label="Sign" value={planetData.rashi} />
                  <InfoFact label="House" value={`${planetData.house}`} />
                </View>
                <Text style={styles.infoBody}>{planetInfo.significance}</Text>
                <Text style={[styles.infoBody, styles.infoBodySpaced]}>
                  {buildPlacementReading(
                    selectedPlanet,
                    planetData.rashi,
                    planetData.house,
                    planetData.isRetrograde
                  )}
                </Text>
                <Text style={[styles.infoBody, styles.infoBodySpaced]}>
                  {conjunctionClause(selectedPlanet, chart.planets)}
                </Text>
              </InfoModal>
            );
          })()}

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Houses (whole sign)</Text>
          <View style={styles.table}>
            {chart.houses.map((rashi, i) => (
              <Pressable
                key={i}
                style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                onPress={() => setSelectedHouse(i + 1)}
              >
                <Text style={[styles.cell, { flex: 0.5 }]}>{i + 1}</Text>
                <Text style={[styles.cell, { flex: 2 }]}>{rashi}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.tableHint}>Tap a house for more information</Text>
        </View>

        {selectedHouse &&
          (() => {
            const houseRashi = chart.houses[selectedHouse - 1];
            const houseInfo = HOUSE_INFO[selectedHouse - 1];
            const rashiLord = RASHI_INFO[houseRashi]?.lord;
            const planetsHere = chart.planets.filter((p) => p.house === selectedHouse);
            return (
              <InfoModal
                visible={!!selectedHouse}
                onClose={() => setSelectedHouse(null)}
                title={`${ordinal(selectedHouse)} House`}
                subtitle={`${houseInfo.sanskritName} · ${houseRashi}`}
              >
                <View style={styles.infoFactsRow}>
                  <InfoFact label="Sign" value={houseRashi} />
                  {rashiLord && <InfoFact label="Lord" value={rashiLord} />}
                </View>
                <Text style={styles.infoBody}>{houseInfo.meaning}</Text>
                <Text style={[styles.infoBody, styles.infoBodySpaced]}>
                  {buildHousePersonalMessage(houseRashi, rashiLord, planetsHere)}
                </Text>
              </InfoModal>
            );
          })()}

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Dasha periods</Text>
          <View style={styles.table}>
            {chart.mahadashas.map((m, i) => {
              const current = isCurrentPeriod(m);
              return (
                <Pressable
                  key={i}
                  style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
                  onPress={() => setSelectedMahadasha(m)}
                >
                  <Text style={[styles.cell, styles.dashaPlanetCell, current && styles.currentText]}>
                    {m.planet}
                    {current ? " (current)" : ""}
                  </Text>
                  <Text style={[styles.cell, styles.dashaDateCell]}>
                    {formatDashaDate(m.startDate)} – {formatDashaDate(m.endDate)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.tableHint}>Tap a period for more information · covers ~120 years from birth</Text>
        </View>

        {selectedMahadasha &&
          (() => {
            const closeAll = () => {
              setSelectedMahadasha(null);
              setSelectedAntardasha(null);
              setSelectedPratyantardasha(null);
            };

            // Stacking native <Modal> components is unreliable (a second Modal opened while one
            // is already visible often doesn't render, especially on Android) - so instead of
            // opening separate modals per level, this single modal swaps its own content between
            // the Mahadasha, Antardasha, and Pratyantardasha views.
            if (selectedAntardasha && selectedPratyantardasha) {
              const info = PLANET_INFO[selectedPratyantardasha.planet];
              const meaning = pratyantardashaMeaning(
                selectedMahadasha.planet,
                selectedAntardasha.planet,
                selectedPratyantardasha.planet,
                chart.houses
              );
              if (!info || !meaning) return null;
              return (
                <InfoModal
                  visible={!!selectedMahadasha}
                  onClose={closeAll}
                  title={`${selectedPratyantardasha.planet} Pratyantardasha`}
                  subtitle={`${formatDashaDate(selectedPratyantardasha.startDate)} – ${formatDashaDate(
                    selectedPratyantardasha.endDate
                  )}`}
                >
                  <Pressable onPress={() => setSelectedPratyantardasha(null)} hitSlop={8}>
                    <Text style={styles.backLink}>‹ Back to {selectedAntardasha.planet} Antardasha</Text>
                  </Pressable>
                  <View style={styles.infoFactsRow}>
                    <InfoFact label="Nature" value={info.nature} />
                    <InfoFact label="Within" value={`${selectedAntardasha.planet} Antardasha`} />
                  </View>
                  <Text style={styles.infoBody}>{meaning}</Text>
                </InfoModal>
              );
            }

            if (selectedAntardasha) {
              const antardashaInfo = PLANET_INFO[selectedAntardasha.planet];
              const meaning = antardashaMeaning(selectedMahadasha.planet, selectedAntardasha.planet, chart.houses);
              if (!antardashaInfo || !meaning) return null;
              return (
                <InfoModal
                  visible={!!selectedMahadasha}
                  onClose={closeAll}
                  title={`${selectedAntardasha.planet} Antardasha`}
                  subtitle={`${formatDashaDate(selectedAntardasha.startDate)} – ${formatDashaDate(
                    selectedAntardasha.endDate
                  )}`}
                >
                  <Pressable
                    onPress={() => {
                      setSelectedAntardasha(null);
                      setSelectedPratyantardasha(null);
                    }}
                    hitSlop={8}
                  >
                    <Text style={styles.backLink}>‹ Back to {selectedMahadasha.planet} Mahadasha</Text>
                  </Pressable>
                  <View style={styles.infoFactsRow}>
                    <InfoFact label="Nature" value={antardashaInfo.nature} />
                    <InfoFact label="Within" value={`${selectedMahadasha.planet} Mahadasha`} />
                  </View>
                  <Text style={styles.infoBody}>{meaning}</Text>
                  <Text style={[styles.infoFactLabel, styles.antardashaHeading]}>
                    PRATYANTARDASHAS (SUB-PERIODS)
                  </Text>
                  {selectedAntardasha.pratyantardashas?.map((p, i) => {
                    const current = isCurrentPeriod(p);
                    return (
                      <Pressable
                        key={i}
                        style={({ pressed }) => [styles.antardashaRow, pressed && styles.rowPressed]}
                        onPress={() => setSelectedPratyantardasha(p)}
                      >
                        <Text style={[styles.antardashaPlanet, current && styles.currentText]}>
                          {p.planet}
                          {current ? " (current)" : ""}
                        </Text>
                        <Text style={styles.antardashaDates}>
                          {formatDashaDate(p.startDate)} – {formatDashaDate(p.endDate)}
                        </Text>
                      </Pressable>
                    );
                  })}
                  <Text style={styles.tableHint}>Tap a sub-period for more information</Text>
                </InfoModal>
              );
            }

            const meaning = mahadashaMeaning(selectedMahadasha.planet, chart.houses);
            if (!meaning) return null;
            return (
              <InfoModal
                visible={!!selectedMahadasha}
                onClose={closeAll}
                title={`${selectedMahadasha.planet} Mahadasha`}
                subtitle={`${formatDashaDate(selectedMahadasha.startDate)} – ${formatDashaDate(
                  selectedMahadasha.endDate
                )}`}
              >
                <Text style={styles.infoBody}>{meaning}</Text>
                <Text style={[styles.infoFactLabel, styles.antardashaHeading]}>ANTARDASHAS (SUB-PERIODS)</Text>
                {selectedMahadasha.antardashas?.map((a, i) => {
                  const current = isCurrentPeriod(a);
                  return (
                    <Pressable
                      key={i}
                      style={({ pressed }) => [styles.antardashaRow, pressed && styles.rowPressed]}
                      onPress={() => setSelectedAntardasha(a)}
                    >
                      <Text style={[styles.antardashaPlanet, current && styles.currentText]}>
                        {a.planet}
                        {current ? " (current)" : ""}
                      </Text>
                      <Text style={styles.antardashaDates}>
                        {formatDashaDate(a.startDate)} – {formatDashaDate(a.endDate)}
                      </Text>
                    </Pressable>
                  );
                })}
                <Text style={styles.tableHint}>Tap a sub-period for more information</Text>
              </InfoModal>
            );
          })()}
      </ScrollView>
    </ScreenBackground>
  );
}

function InfoFact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoFact}>
      <Text style={styles.infoFactLabel}>{label}</Text>
      <Text style={styles.infoFactValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  centered: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#dbd8d8ff", marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: "#f5effa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  cardPressed: { opacity: 0.7 },
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardLabel: { fontSize: 12, color: "#5b2a86", fontWeight: "600" },
  tapHint: { fontSize: 11, color: "#6e4e8bff" },
  cardValue: { fontSize: 18, fontWeight: "700", marginTop: 4 },
  infoFactsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  infoFact: { alignItems: "center", flex: 1 },
  infoFactLabel: { fontSize: 11, color: "#999" },
  infoFactValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  infoBody: { fontSize: 14, color: "#333", lineHeight: 21 },
  infoBodySpaced: { marginTop: 12 },
  cardHeading: { fontSize: 15, fontWeight: "700", color: "#5b2a86", marginBottom: 10 },
  table: { borderRadius: 8, overflow: "hidden" },
  tableHint: { fontSize: 11, color: "#999", marginTop: 10, textAlign: "center" },
  row: { flexDirection: "row", paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: "#e8def0" },
  rowPressed: { backgroundColor: "#fff" },
  headerRow: {},
  cell: { fontSize: 13 },
  headerCell: { fontWeight: "700", color: "#333" },
  dashaPlanetCell: { flex: 1 },
  dashaDateCell: { flex: 1.6, color: "#1d1d1dff" },
  currentText: { fontWeight: "700", color: "#5b2a86" },
  antardashaHeading: { marginTop: 20, marginBottom: 8, letterSpacing: 0.5 },
  antardashaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e8def0",
  },
  antardashaPlanet: { fontSize: 13, fontWeight: "600" },
  antardashaDates: { fontSize: 12, color: "#5f5e5eff" },
  backLink: { fontSize: 13, color: "#5b2a86", fontWeight: "600", marginBottom: 16 },
});
