import { useEffect, useRef, useState } from "react";
import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { initDatabase } from "@/lib/db";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    initDatabase()
      .then(() => {
        if (mounted.current) setReady(true);
      })
      .catch((e) => {
        console.error("DB init failed", e);
        if (mounted.current) setReady(true);
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  if (!ready) {
    return (
      <SafeAreaProvider>
        <PaperProvider>
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        </PaperProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="places"
            options={{ title: "Места" }}
          />
          <Stack.Screen
            name="trips"
            options={{ title: "Поездки" }}
          />
          <Stack.Screen
            name="next"
            options={{ title: "Следующее место" }}
          />
          <Stack.Screen
            name="settings"
            options={{ title: "Настройки" }}
          />
        </Stack>
      </PaperProvider>
    </SafeAreaProvider>
  );
}
