import { Stack } from "expo-router";
import { useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function PlaceIdLayout() {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ title: t("nav.place") }} />
      <Stack.Screen name="edit" options={{ title: t("nav.edit") }} />
    </Stack>
  );
}
