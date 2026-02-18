import { View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function TripsScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text variant="titleMedium">{t("trips.title")}</Text>
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>
        {t("trips.stub")}
      </Text>
    </View>
  );
}
