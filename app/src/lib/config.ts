import Constants from "expo-constants";

const BACKEND_PORT = 3000;

/**
 * In Expo Go / dev builds, hostUri is "<lan-ip>:<metro-port>" - reuse the LAN IP but
 * point at our own backend's port, so the app works on a physical device without any
 * manual IP configuration. Falls back to localhost for web/simulator.
 */
function resolveApiBaseUrl(): string {
  const hostUri = Constants.expoConfig?.hostUri;
  const host = hostUri?.split(":")[0];
  return host ? `http://${host}:${BACKEND_PORT}` : `http://localhost:${BACKEND_PORT}`;
}

export const API_BASE_URL = resolveApiBaseUrl();
