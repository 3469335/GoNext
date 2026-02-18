import { View } from "react-native";
import { Text } from "react-native-paper";

export default function PlacesScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text variant="titleMedium">Список мест</Text>
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>
        Здесь будет список мест (этап 3).
      </Text>
    </View>
  );
}
