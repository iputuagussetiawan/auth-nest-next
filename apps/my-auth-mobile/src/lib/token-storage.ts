import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'my-auth-access-token';

export async function getAccessToken() {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setAccessToken(token: string) {
  try {
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token);
  } catch {
    // SecureStore is unavailable on unsupported runtimes; auth remains session-only.
  }
}

export async function clearAccessToken() {
  try {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  } catch {
    // Nothing to clear when SecureStore is unavailable.
  }
}
