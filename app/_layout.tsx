import { useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useThemeMode } from "@/lib/ThemeContext";
import { OrientationProvider, useOrientation } from "@/lib/OrientationContext";
import { scaleThemeFonts } from "@/lib/scaleThemeFonts";
import {
  getOnPrimary,
  getOnPrimaryContainer,
  getPrimaryContainer,
} from "@/lib/themeColors";
import i18n, { LANG_STORAGE_KEY, SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { initDatabase } from "@/lib/db";

function RootLayoutContent() {
  const { theme, primaryColor } = useThemeMode();
  const { fontScale } = useOrientation();
  const { t } = useTranslation();
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    Promise.all([
      initDatabase(),
      AsyncStorage.getItem(LANG_STORAGE_KEY),
    ])
      .then(([, savedLang]) => {
        if (mounted.current && savedLang && SUPPORTED_LANGUAGES.includes(savedLang as "ru" | "en")) {
          i18n.changeLanguage(savedLang);
        }
        if (mounted.current) setReady(true);
      })
      .catch((e) => {
        console.error("Init failed", e);
        if (mounted.current) setReady(true);
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  const baseTheme = theme === "dark" ? MD3DarkTheme : MD3LightTheme;
  const isDark = theme === "dark";
  let paperTheme =
    primaryColor != null
      ? {
          ...baseTheme,
          colors: {
            ...baseTheme.colors,
            primary: primaryColor,
            onPrimary: getOnPrimary(primaryColor),
            primaryContainer: getPrimaryContainer(primaryColor, isDark),
            onPrimaryContainer: getOnPrimaryContainer(primaryColor, isDark),
          },
        }
      : baseTheme;
  paperTheme = scaleThemeFonts(paperTheme, fontScale);

  const screenStyle = { flex: 1, backgroundColor: paperTheme.colors.background };

  if (!ready) {
    return (
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <View style={[screenStyle, { justifyContent: "center", alignItems: "center" }]}>
            <ActivityIndicator size="large" />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={paperTheme}>
        <View style={screenStyle}>
        <Stack
          screenOptions={{
            contentStyle: screenStyle,
          }}
        >
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="places"
            options={{ title: t("nav.places") }}
          />
          <Stack.Screen
            name="trips"
            options={{ title: t("nav.trips") }}
          />
          <Stack.Screen
            name="next"
            options={{ title: t("nav.nextPlace") }}
          />
          <Stack.Screen
            name="settings"
            options={{ title: t("nav.settings") }}
          />
        </Stack>
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <OrientationProvider>
        <RootLayoutContent />
      </OrientationProvider>
    </ThemeProvider>
  );
}
