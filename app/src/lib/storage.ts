import AsyncStorage from "@react-native-async-storage/async-storage";
import { BirthProfile } from "../types";

const PROFILE_KEY = "astrology.birthProfile";

export async function getProfile(): Promise<BirthProfile | null> {
  const raw = await AsyncStorage.getItem(PROFILE_KEY);
  return raw ? (JSON.parse(raw) as BirthProfile) : null;
}

export async function saveProfile(profile: BirthProfile): Promise<void> {
  await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
  await AsyncStorage.removeItem(PROFILE_KEY);
}
