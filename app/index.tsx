import { StyleSheet, View } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="GoNext" />
      </Appbar.Header>

      <View style={styles.content}>
        <Button
          mode="contained"
          onPress={() => router.push("/places")}
          style={styles.button}
        >
          Места
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/trips")}
          style={styles.button}
        >
          Поездки
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/next")}
          style={styles.button}
        >
          Следующее место
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/settings")}
          style={styles.button}
        >
          Настройки
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  button: {
    minWidth: 200,
    marginBottom: 16,
  },
});
