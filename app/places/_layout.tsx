import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function PlacesLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("nav.places") }} />
      <Stack.Screen name="new" options={{ title: t("nav.newPlace") }} />
      <Stack.Screen name="[id]" options={{ title: t("nav.place") }} />
    </Stack>
  );
}
