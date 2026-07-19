import React from "react";
import { View, StyleSheet, DimensionValue } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

/**
 * A handful of small, fixed-position "stars" - deliberately sparse and low-opacity so the
 * background stays a quiet backdrop rather than competing with card content for attention.
 * No image asset involved (everything here is code/color), so there's nothing to license.
 */
const STARS: { top: DimensionValue; left: DimensionValue; size: number }[] = [
  { top: "6%", left: "12%", size: 3 },
  { top: "9%", left: "78%", size: 2 },
  { top: "15%", left: "45%", size: 2 },
  { top: "21%", left: "88%", size: 3 },
  { top: "27%", left: "20%", size: 2 },
  { top: "33%", left: "65%", size: 3 },
  { top: "40%", left: "8%", size: 2 },
  { top: "46%", left: "92%", size: 2 },
  { top: "52%", left: "35%", size: 3 },
  { top: "59%", left: "72%", size: 2 },
  { top: "66%", left: "15%", size: 2 },
  { top: "73%", left: "55%", size: 3 },
  { top: "80%", left: "85%", size: 2 },
  { top: "86%", left: "28%", size: 2 },
  { top: "92%", left: "60%", size: 3 },
];

/**
 * Shared full-screen backdrop: a soft, light sky-toned gradient with a light sprinkle of
 * stars, sitting behind whatever's passed as children. Stays fixed to the viewport (doesn't
 * scroll with content) - screens using this should keep their own ScrollView/container
 * background transparent so the gradient shows through.
 */
export default function ScreenBackground({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.flex}>
      <LinearGradient colors={["#9876b1ff", "#ae98c5ff", "#8199ccff"]} style={StyleSheet.absoluteFill} />
      {STARS.map((star, i) => (
        <View
          key={i}
          style={[
            styles.star,
            {
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              borderRadius: star.size / 2,
            },
          ]}
        />
      ))}
      <View style={styles.flex}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  star: {
    position: "absolute",
    backgroundColor: "rgba(255, 255, 255, 0.52)",
  },
});
