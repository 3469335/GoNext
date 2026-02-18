import { View } from "react-native";
import { Text } from "react-native-paper";

export default function SettingsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text variant="titleMedium">Настройки</Text>
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>
        Здесь будут настройки приложения (этап 6).
      </Text>
    </View>
  );
}
