import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { RASHI_INFO } from "../constants/rashiInfo";
import { PLANET_INFO } from "../constants/planetInfo";
import { HOUSE_INFO } from "../constants/houseInfo";
import InfoModal from "../components/InfoModal";
import ScreenBackground from "../components/ScreenBackground";
import { ordinal } from "../lib/format";

type Selection = { kind: "planet" | "house" | "sign"; key: string } | null;

export default function GuideScreen() {
  const [selection, setSelection] = useState<Selection>(null);

  return (
    <ScreenBackground>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>Your guide to Vedic astrology</Text>
        <Text style={styles.subtitle}>
          General meanings for the planets, houses, and signs used throughout your chart.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Planets</Text>
          {Object.keys(PLANET_INFO).map((planet) => (
            <GuideRow
              key={planet}
              label={planet}
              value={PLANET_INFO[planet].sanskritName}
              onPress={() => setSelection({ kind: "planet", key: planet })}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Houses</Text>
          {HOUSE_INFO.map((house, i) => (
            <GuideRow
              key={i}
              label={`${ordinal(i + 1)} House`}
              value={house.sanskritName}
              onPress={() => setSelection({ kind: "house", key: String(i + 1) })}
            />
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHeading}>Signs</Text>
          {Object.keys(RASHI_INFO).map((rashi) => (
            <GuideRow
              key={rashi}
              label={rashi}
              value={RASHI_INFO[rashi].sanskritName}
              onPress={() => setSelection({ kind: "sign", key: rashi })}
            />
          ))}
        </View>
      </ScrollView>

      {selection?.kind === "planet" &&
        (() => {
          const info = PLANET_INFO[selection.key];
          if (!info) return null;
          return (
            <InfoModal
              visible
              onClose={() => setSelection(null)}
              title={selection.key}
              subtitle={`${info.sanskritName} · ${info.nature}`}
            >
              <Text style={styles.infoBody}>{info.significance}</Text>
            </InfoModal>
          );
        })()}

      {selection?.kind === "house" &&
        (() => {
          const info = HOUSE_INFO[Number(selection.key) - 1];
          if (!info) return null;
          return (
            <InfoModal
              visible
              onClose={() => setSelection(null)}
              title={`${ordinal(Number(selection.key))} House`}
              subtitle={`${info.sanskritName} · ${info.theme}`}
            >
              <Text style={styles.infoBody}>{info.meaning}</Text>
            </InfoModal>
          );
        })()}

      {selection?.kind === "sign" &&
        (() => {
          const info = RASHI_INFO[selection.key];
          if (!info) return null;
          return (
            <InfoModal
              visible
              onClose={() => setSelection(null)}
              title={selection.key}
              subtitle={`${info.sanskritName} · ${info.symbol}`}
            >
              <View style={styles.infoFactsRow}>
                <InfoFact label="Element" value={info.element} />
                <InfoFact label="Modality" value={info.modality} />
                <InfoFact label="Lord" value={info.lord} />
              </View>
              <Text style={styles.infoBody}>{info.ascendantMeaning}</Text>
            </InfoModal>
          );
        })()}
    </ScreenBackground>
  );
}

function GuideRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      onPress={onPress}
    >
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value} ›</Text>
    </Pressable>
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
  container: { flex: 1, padding: 20, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: "700" },
  subtitle: { fontSize: 13, color: "#e2ddddff", marginTop: 4, marginBottom: 20, lineHeight: 18 },
  card: { backgroundColor: "#f5effa", borderRadius: 12, padding: 16, marginBottom: 24 },
  cardHeading: { fontSize: 15, fontWeight: "700", color: "#5b2a86", marginBottom: 4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8def0",
  },
  rowPressed: { opacity: 0.6 },
  rowLabel: { fontSize: 14, fontWeight: "600" },
  rowValue: { fontSize: 13, color: "#666" },
  infoFactsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  infoFact: { alignItems: "center", flex: 1 },
  infoFactLabel: { fontSize: 11, color: "#999" },
  infoFactValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
  infoBody: { fontSize: 14, color: "#333", lineHeight: 21 },
});
