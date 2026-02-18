import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { Button, Checkbox, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { getPlaceById, updatePlace } from "@/lib/places";

export default function EditPlaceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placeId = id ? parseInt(id, 10) : NaN;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visitlater, setVisitlater] = useState(true);
  const [liked, setLiked] = useState(false);
  const [coordsStr, setCoordsStr] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { t } = useTranslation();

  useEffect(() => {
    if (isNaN(placeId)) return;
    getPlaceById(placeId).then((place) => {
      if (place) {
        setName(place.name);
        setDescription(place.description);
        setVisitlater(place.visitlater);
        setLiked(place.liked);
        if (place.latitude != null && place.longitude != null) {
          setCoordsStr(`${place.latitude}, ${place.longitude}`);
        } else {
          setCoordsStr("");
        }
      }
      setLoading(false);
    });
  }, [placeId]);

  const handleSave = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(t("places.form.errorName"));
      return;
    }
    const parts = coordsStr.trim().split(/[\s,;]+/).filter(Boolean);
    let lat: number | null = null;
    let lon: number | null = null;
    if (parts.length >= 2) {
      lat = parseFloat(parts[0]);
      lon = parseFloat(parts[1]);
    } else if (parts.length === 1) {
      setError(t("places.form.errorCoords"));
      return;
    }
    if (lat != null && (isNaN(lat) || lat < -90 || lat > 90)) {
      setError(t("places.form.errorLat"));
      return;
    }
    if (lon != null && (isNaN(lon) || lon < -180 || lon > 180)) {
      setError(t("places.form.errorLon"));
      return;
    }
    setError("");
    setSaving(true);
    try {
      await updatePlace(placeId, {
        name: trimmedName,
        description: description.trim(),
        visitlater,
        liked,
        latitude: lat ?? null,
        longitude: lon ?? null,
      });
      router.replace(`/places/${placeId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("places.form.errorSave"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <TextInput
        label={t("places.form.name")}
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label={t("places.form.description")}
        value={description}
        onChangeText={setDescription}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={styles.input}
      />
      <Checkbox.Item
        label={t("places.form.visitLater")}
        status={visitlater ? "checked" : "unchecked"}
        onPress={() => setVisitlater((v) => !v)}
      />
      <Checkbox.Item
        label={t("places.form.liked")}
        status={liked ? "checked" : "unchecked"}
        onPress={() => setLiked((v) => !v)}
      />
      <TextInput
        label={t("places.form.coords")}
        value={coordsStr}
        onChangeText={setCoordsStr}
        mode="outlined"
        keyboardType="numbers-and-punctuation"
        placeholder={t("places.form.coordsPlaceholder")}
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
        {t("places.form.save")}
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
