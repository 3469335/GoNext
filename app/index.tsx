import { ImageBackground, StyleSheet, View } from "react-native";
import { Appbar, Button } from "react-native-paper";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useThemeMode } from "@/lib/ThemeContext";

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useThemeMode();
  const { t } = useTranslation();

  const content = (
    <>
      <Appbar.Header>
        <Appbar.Content title={t("common.appName")} />
      </Appbar.Header>
      <View style={styles.content}>
        <Button
          mode="contained"
          onPress={() => router.push("/places")}
          style={styles.button}
        >
          {t("home.places")}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/trips")}
          style={styles.button}
        >
          {t("home.trips")}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/next")}
          style={styles.button}
        >
          {t("home.nextPlace")}
        </Button>
        <Button
          mode="contained"
          onPress={() => router.push("/settings")}
          style={styles.button}
        >
          {t("home.settings")}
        </Button>
      </View>
    </>
  );

  if (theme === "light") {
    return (
      <ImageBackground
        source={require("../assets/backgrounds/gonext-bg.png")}
        style={styles.container}
        resizeMode="cover"
      >
        {content}
      </ImageBackground>
    );
  }

  return <View style={styles.container}>{content}</View>;
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
