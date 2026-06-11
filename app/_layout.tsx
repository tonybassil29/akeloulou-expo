import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="recipe/[id]"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="suggestion"
          options={{ headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}