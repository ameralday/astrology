import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import DateTimePicker, { DateTimePickerAndroid } from "@react-native-community/datetimepicker";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation";
import { searchPlaces, PlaceResult } from "../lib/geocode";
import { fetchChart } from "../lib/api";
import { saveProfile } from "../lib/storage";
import ScreenBackground from "../components/ScreenBackground";

type Props = NativeStackScreenProps<RootStackParamList, "BirthData">;

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function BirthDataScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [birthTime, setBirthTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const [placeQuery, setPlaceQuery] = useState("");
  const [placeResults, setPlaceResults] = useState<PlaceResult[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PlaceResult | null>(null);
  const [searching, setSearching] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onPlaceQueryChange(text: string) {
    setPlaceQuery(text);
    setSelectedPlace(null);
    if (text.trim().length < 3) {
      setPlaceResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchPlaces(text);
      setPlaceResults(results);
    } catch {
      setPlaceResults([]);
    } finally {
      setSearching(false);
    }
  }

  function openDatePicker() {
    if (Platform.OS === "android") {
      // On Android the inline component fires onChange on every scroll tick, so the
      // library recommends this imperative dialog instead - it only reports a value
      // once the user taps OK (event.type === "set").
      DateTimePickerAndroid.open({
        value: birthDate ?? new Date(2000, 0, 1),
        mode: "date",
        maximumDate: new Date(),
        onChange: (event, selected) => {
          if (event.type === "set" && selected) setBirthDate(selected);
        },
      });
    } else {
      setShowDatePicker(true);
    }
  }

  function openTimePicker() {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        value: birthTime ?? new Date(2000, 0, 1, 12, 0),
        mode: "time",
        is24Hour: true,
        onChange: (event, selected) => {
          if (event.type === "set" && selected) setBirthTime(selected);
        },
      });
    } else {
      setShowTimePicker(true);
    }
  }

  const canSubmit = !!birthDate && !!birthTime && !!selectedPlace && !submitting;

  async function onSubmit() {
    if (!birthDate || !birthTime || !selectedPlace) return;
    setSubmitting(true);
    setError(null);
    try {
      const date = formatDate(birthDate);
      const time = formatTime(birthTime);
      const chart = await fetchChart({
        date,
        time,
        timezone: selectedPlace.timezone,
        lat: selectedPlace.lat,
        lon: selectedPlace.lon,
      });
      await saveProfile({
        name: name.trim(),
        date,
        time,
        timezone: selectedPlace.timezone,
        lat: selectedPlace.lat,
        lon: selectedPlace.lon,
        placeLabel: selectedPlace.label,
        chart,
      });
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenBackground>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Your birth details</Text>
          <Text style={styles.subtitle}>
            Stored only on this device - never sent anywhere except to compute your chart.
          </Text>

          <Text style={styles.label}>Name (optional)</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Name"
            placeholderTextColor="#000"
            underlineColorAndroid="transparent"
          />

          <Text style={styles.label}>Birth date</Text>
          <Pressable style={styles.input} onPress={openDatePicker}>
            <Text>{birthDate ? formatDate(birthDate) : "Select a date"}</Text>
          </Pressable>
          {showDatePicker && Platform.OS === "ios" && (
            <View style={styles.iosPickerWrap}>
              <DateTimePicker
                value={birthDate ?? new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                maximumDate={new Date()}
                onChange={(_event, selected) => {
                  if (selected) setBirthDate(selected);
                }}
              />
              <Pressable style={styles.doneButton} onPress={() => setShowDatePicker(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.label}>Birth time</Text>
          <Pressable style={styles.input} onPress={openTimePicker}>
            <Text>{birthTime ? formatTime(birthTime) : "Select a time"}</Text>
          </Pressable>
          {showTimePicker && Platform.OS === "ios" && (
            <View style={styles.iosPickerWrap}>
              <DateTimePicker
                value={birthTime ?? new Date(2000, 0, 1, 12, 0)}
                mode="time"
                display="spinner"
                is24Hour
                onChange={(_event, selected) => {
                  if (selected) setBirthTime(selected);
                }}
              />
              <Pressable style={styles.doneButton} onPress={() => setShowTimePicker(false)}>
                <Text style={styles.doneButtonText}>Done</Text>
              </Pressable>
            </View>
          )}

          <Text style={styles.label}>Birth place</Text>
          <TextInput
            style={styles.input}
            value={placeQuery}
            onChangeText={onPlaceQueryChange}
            placeholder="Start typing a city..."
            placeholderTextColor="#000"
            underlineColorAndroid="transparent"
          />
          <Text style={styles.attribution}>Place data © GeoNames.org, CC-BY 4.0</Text>
          {searching && <ActivityIndicator style={{ marginVertical: 8 }} />}
          {!selectedPlace && placeResults.length > 0 && (
            <View style={styles.resultsList}>
              {placeResults.map((item, i) => (
                <Pressable
                  key={`${item.lat},${item.lon},${i}`}
                  style={styles.resultRow}
                  onPress={() => {
                    setSelectedPlace(item);
                    setPlaceQuery(item.label);
                    setPlaceResults([]);
                  }}
                >
                  <Text numberOfLines={2}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {selectedPlace && (
            <Text style={styles.timezoneHint}>Timezone: {selectedPlace.timezone}</Text>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          <Pressable
            style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
            disabled={!canSubmit}
            onPress={onSubmit}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>See my chart</Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#fcf9f9ef", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#333", marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#727272ff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  iosPickerWrap: { backgroundColor: "#ebe3e3ff", borderRadius: 8, marginTop: 4, overflow: "hidden" },
  doneButton: { alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#e2e2e2" },
  doneButtonText: { color: "#5b2a86", fontWeight: "700", fontSize: 15 },
  attribution: { fontSize: 10, color: "#444444ff", marginTop: 4 },
  resultsList: { borderWidth: 1, borderColor: "#eee", borderRadius: 8, marginTop: 4, overflow: "hidden" },
  resultRow: { padding: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
  timezoneHint: { marginTop: 6, fontSize: 12, color: "#2e2e2eff" },
  error: { color: "#c00", marginTop: 12 },
  submitButton: {
    marginTop: 28,
    backgroundColor: "#5b2a86",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitButtonDisabled: { opacity: 0.4 },
  submitButtonText: { color: "#ffffffff", fontSize: 16, fontWeight: "600" },
});
