import * as SecureStore from 'expo-secure-store';

const ADMIN_TOKEN_KEY = 'akel_loulou_admin_token';
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'loulou2024',
};

export async function login(username: string, password: string): Promise<boolean> {
  if (
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password
  ) {
    const token = btoa(`${username}:${password}:${Date.now()}`);
    await SecureStore.setItemAsync(ADMIN_TOKEN_KEY, token);
    return true;
  }
  return false;
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(ADMIN_TOKEN_KEY);
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
  return token !== null;
}

export async function getAdminToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ADMIN_TOKEN_KEY);
}