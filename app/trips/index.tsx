import { View } from "react-native";
import { Text } from "react-native-paper";

export default function TripsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text variant="titleMedium">Список поездок</Text>
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>
        Здесь будет список поездок (этап 4).
      </Text>
    </View>
  );
}
