import { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import { useRouter } from "expo-router";
import { createPlace } from "@/lib/places";

export default function NewPlaceScreen() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [coordsStr, setCoordsStr] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Введите название");
      return;
    }
    const parts = coordsStr.trim().split(/[\s,;]+/).filter(Boolean);
    let lat: number | null = null;
    let lon: number | null = null;
    if (parts.length >= 2) {
      lat = parseFloat(parts[0]);
      lon = parseFloat(parts[1]);
    } else if (parts.length === 1) {
      setError("Введите широту и долготу через запятую");
      return;
    }
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setError("Широта: число от -90 до 90");
      return;
    }
    if (lon != null && (isNaN(lon) || lon < -180 || lon > 180)) {
      setError("Долгота: число от -180 до 180");
      return;
    }
    setError("");
    setSaving(true);
    try {
      await createPlace({
        name: trimmedName,
        description: description.trim(),
        visitlater,
        liked,
        latitude: lat ?? null,
        longitude: lon ?? null,
      });
      router.replace("/places");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ошибка сохранения");
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <TextInput
        label="Название *"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Описание"
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <Checkbox.Item
        label="Хочу посетить позже"
        status={visitlater ? "checked" : "unchecked"}
        onPress={() => setVisitlater((v) => !v)}
      />
      <Checkbox.Item
        label="Понравилось"
        status={liked ? "checked" : "unchecked"}
        onPress={() => setLiked((v) => !v)}
      />
      <TextInput
        label="Координаты (широта, долгота)"
        value={coordsStr}
        onChangeText={setCoordsStr}
        mode="outlined"
        keyboardType="numbers-and-punctuation"
        placeholder="55.7558, 37.6173"
        style={styles.input}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        disabled={saving}
        style={styles.button}
      >
        Сохранить
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  input: { marginBottom: 12 },
  error: { color: "#b00020", marginBottom: 8 },
  button: { marginTop: 8 },
});
