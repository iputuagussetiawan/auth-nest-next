import * as SecureStore from 'expo-secure-store';

// Everything auth-related lives in the Keychain (iOS) / Keystore (Android). The app doesn't use its
// cookie store for auth, because that is plain files in the app's data folder.
const ACCESS_TOKEN_KEY = 'my-auth-access-token';
const REFRESH_TOKEN_KEY = 'my-auth-refresh-token';
const DEVICE_ID_KEY = 'my-auth-device-id';

async function read(key: string) {
  try {
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

async function write(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // SecureStore is unavailable on unsupported runtimes; auth remains session-only.
  }
}

async function remove(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch {
    // Nothing to clear when SecureStore is unavailable.
  }
}

export function getAccessToken() {
  return read(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  return read(REFRESH_TOKEN_KEY);
}

export async function setTokens(accessToken: string, refreshToken: string) {
  await Promise.all([write(ACCESS_TOKEN_KEY, accessToken), write(REFRESH_TOKEN_KEY, refreshToken)]);
}

export async function clearTokens() {
  await Promise.all([remove(ACCESS_TOKEN_KEY), remove(REFRESH_TOKEN_KEY)]);
}

let deviceId: string | null = null;

/**
 * Identifies this install to the API, so signing in again replaces its old session instead of adding
 * one. Kept across sign-outs, like the browser's deviceId cookie.
 */
export async function getDeviceId() {
  if (!deviceId) {
    deviceId = (await read(DEVICE_ID_KEY)) ?? randomUuid();
    await write(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

// An identifier, not a secret, so Math.random is good enough
function randomUuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
