import { View } from "react-native";
import { Text } from "react-native-paper";
import { useTranslation } from "react-i18next";

export default function NextPlaceScreen() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text variant="titleMedium">{t("next.title")}</Text>
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>
        {t("next.stub")}
      </Text>
    </View>
  );
}
