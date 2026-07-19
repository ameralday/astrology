import Constants from "expo-constants";

const BACKEND_PORT = 3000;
const PROD_API_BASE_URL = "https://astrology-backend-71922802794.europe-west1.run.app";

// Flip this to true to point the app at the deployed Cloud Run backend instead of your
// local dev server - useful for testing the real deployment without a redeploy loop.
const USE_PROD_BACKEND = false;

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

export const API_BASE_URL = USE_PROD_BACKEND ? PROD_API_BASE_URL : resolveApiBaseUrl();
