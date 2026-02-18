import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { List, SegmentedButtons, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useThemeMode, PRIMARY_COLOR_OPTIONS } from "@/lib/ThemeContext";
import { useOrientation } from "@/lib/OrientationContext";
import i18n, { LANG_STORAGE_KEY, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";

export default function SettingsScreen() {
  const { theme, setTheme, primaryColor, setPrimaryColor } = useThemeMode();
  const { orientation, setOrientation } = useOrientation();
  const paperTheme = useTheme();
  const { t } = useTranslation();
  const selectionBorder = paperTheme.dark ? "#fff" : "#000";
  const currentLang = (i18n.language || "ru") as SupportedLanguage;

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    await i18n.changeLanguage(lang);
    await AsyncStorage.setItem(LANG_STORAGE_KEY, lang);
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <List.Section>
        <List.Subheader>{t("settings.appearance")}</List.Subheader>
        <List.Item
          title={t("settings.theme")}
          description={t("settings.themeDescription")}
          left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
        />
        <View style={styles.segmented}>
          <SegmentedButtons
            value={theme}
            onValueChange={(v) => {
              if (v === "light" || v === "dark") setTheme(v);
            }}
            buttons={[
              { value: "light", label: t("settings.light"), icon: "white-balance-sunny" },
              { value: "dark", label: t("settings.dark"), icon: "moon-waning-crescent" },
            ]}
          />
        </View>
        <List.Item
          title={t("settings.primaryColor")}
          description={t("settings.primaryColorDescription")}
          left={(props) => <List.Icon {...props} icon="palette" />}
        />
        <View style={styles.colorRow}>
          {PRIMARY_COLOR_OPTIONS.map((hex) => {
            const isSelected = primaryColor === hex;
            return (
              <TouchableOpacity
                key={hex}
                onPress={() => setPrimaryColor(isSelected ? null : hex)}
                style={[
                  styles.colorCircle,
                  { backgroundColor: hex },
                  isSelected && [styles.colorCircleSelected, { borderColor: selectionBorder }],
                ]}
              />
            );
          })}
        </View>
        {primaryColor != null && (
          <List.Item
            title={t("settings.resetColor")}
            description={t("settings.resetColorDescription")}
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
            onPress={() => setPrimaryColor(null)}
          />
        )}
        <List.Item
          title={t("settings.orientation")}
          description={t("settings.orientationDescription")}
          left={(props) => <List.Icon {...props} icon="screen-rotation" />}
        />
        <View style={styles.segmented}>
          <SegmentedButtons
            value={orientation}
            onValueChange={(v) => {
              if (v === "portrait" || v === "landscape") setOrientation(v);
            }}
            buttons={[
              { value: "portrait", label: t("settings.portrait"), icon: "cellphone" },
              { value: "landscape", label: t("settings.landscape"), icon: "tablet" },
            ]}
          />
        </View>
        <List.Item
          title={t("settings.language")}
          description={t("settings.languageDescription")}
          left={(props) => <List.Icon {...props} icon="translate" />}
        />
        <View style={styles.segmented}>
          <SegmentedButtons
            value={currentLang}
            onValueChange={(v) => {
              if (v === "ru" || v === "en") handleLanguageChange(v);
            }}
            buttons={[
              { value: "ru", label: t("settings.russian") },
              { value: "en", label: t("settings.english") },
            ]}
          />
        </View>
      </List.Section>
    </ScrollView>
  );
}

const CIRCLE_SIZE = 32;
const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  segmented: { marginHorizontal: 16, marginBottom: 24 },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: 16,
    marginBottom: 16,
  },
  colorCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    marginRight: 12,
    marginBottom: 12,
    borderRadius: CIRCLE_SIZE / 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorCircleSelected: {
    borderWidth: 3,
  },
});
