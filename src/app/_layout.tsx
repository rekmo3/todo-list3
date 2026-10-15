import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import {
  AuthLoading,
  ConvexReactClient,
  useConvexAuth,
} from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

SplashScreen.preventAutoHideAsync().catch(() => {});

const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;
if (!convexUrl) {
  throw new Error(
    "Не задано EXPO_PUBLIC_CONVEX_URL. Додайте URL деплою у .env і перезапустіть: npx expo start -c",
  );
}

const convex = new ConvexReactClient(convexUrl, {
  unsavedChangesWarning: false,
});

// JWT-токени зберігаються в iOS Keychain / Android Keystore.
// На вебі SecureStore недоступний — бібліотека сама використає localStorage.
const secureStorage = {
  getItem: SecureStore.getItemAsync,
  setItem: SecureStore.setItemAsync,
  removeItem: SecureStore.deleteItemAsync,
};

function AppShell() {
  const { isDarkMode, colors, loaded: themeLoaded } = useTheme();
  const { isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (themeLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [themeLoaded]);

  if (!themeLoaded) return null;

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Один навігатор завжди змонтований; Stack.Protected сам перенаправляє
          між гостьовими екранами та основним додатком при зміні сесії. */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
        }}
      >
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="sign-up" />
        </Stack.Protected>
      </Stack>

      {/* Поки Convex Auth перевіряє збережену сесію */}
      <AuthLoading>
        <View
          style={[StyleSheet.absoluteFill, styles.loading, { backgroundColor: colors.bg }]}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </AuthLoading>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ConvexAuthProvider
        client={convex}
        storage={Platform.OS === "web" ? undefined : secureStorage}
      >
        <ThemeProvider>
          <AppShell />
        </ThemeProvider>
      </ConvexAuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: "center", justifyContent: "center" },
});
