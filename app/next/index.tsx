import { View } from "react-native";
import { Text } from "react-native-paper";

export default function NextPlaceScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24 }}>
      <Text variant="titleMedium">Следующее место</Text>
      <Text variant="bodyMedium" style={{ marginTop: 8 }}>
        Здесь будет следующее место по маршруту (этап 5).
      </Text>
    </View>
  );
}
