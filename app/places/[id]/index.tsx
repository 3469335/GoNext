import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Button,
  Card,
  IconButton,
  List,
  Text,
  TextInput,
} from "react-native-paper";
import { useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  addPlaceContact,
  addPlacePhoto,
  deletePlace,
  deletePlaceContact,
  deletePlacePhoto,
  getPlaceById,
  getPlaceContacts,
  getPlacePhotos,
} from "@/lib/places";
import { openPlaceOnMap } from "@/lib/map";
import { savePlacePhotoFromUri, deletePhotoFile } from "@/lib/photoStorage";
import type { Place, PlaceContact, PlacePhoto } from "@/lib/types";

export default function PlaceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const placeId = id ? parseInt(id, 10) : NaN;
  const [place, setPlace] = useState<Place | null>(null);
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [contacts, setContacts] = useState<PlaceContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [newContactKind, setNewContactKind] = useState("");
  const [newContactValue, setNewContactValue] = useState("");
  const router = useRouter();

  const load = useCallback(async () => {
    if (isNaN(placeId)) return;
    setLoading(true);
    const [p, ph, c] = await Promise.all([
      getPlaceById(placeId),
      getPlacePhotos(placeId),
      getPlaceContacts(placeId),
    ]);
    setPlace(p ?? null);
    setPhotos(ph);
    setContacts(c);
    setLoading(false);
  }, [placeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    load();
  }, [load]);

  const handleOpenMap = () => {
    if (!place || place.latitude == null || place.longitude == null) return;
    openPlaceOnMap(place.latitude, place.longitude);
  };

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Нет доступа к галерее");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]?.uri) return;
    try {
      const path = await savePlacePhotoFromUri(placeId, result.assets[0].uri);
      await addPlacePhoto(placeId, path);
      load();
    } catch (e) {
      Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось добавить фото");
    }
  };

  const handleDeletePhoto = async (photo: PlacePhoto) => {
    try {
      await deletePlacePhoto(photo.id);
      await deletePhotoFile(photo.path);
      load();
    } catch (e) {
      Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось удалить");
    }
  };

  const handleAddContact = async () => {
    const kind = newContactKind.trim();
    const value = newContactValue.trim();
    if (!kind || !value) return;
    try {
      await addPlaceContact(placeId, kind, value);
      setNewContactKind("");
      setNewContactValue("");
      load();
    } catch (e) {
      Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось добавить контакт");
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await deletePlaceContact(contactId);
      load();
    } catch (e) {
      Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось удалить");
    }
  };

  const handleDeletePlace = () => {
    Alert.alert(
      "Удалить место?",
      `«${place?.name}» будет удалено.`,
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlace(placeId);
              router.replace("/places");
            } catch (e) {
              Alert.alert("Ошибка", e instanceof Error ? e.message : "Не удалось удалить");
            }
          },
        },
      ]
    );
  };

  if (loading && !place) return null;
  if (!place) {
    return (
      <View style={styles.centered}>
        <Text>Место не найдено</Text>
      </View>
    );
  }

  const hasCoords = place.latitude != null && place.longitude != null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Title title={place.name} subtitle={place.description || undefined} />
        <Card.Content>
          <Text variant="bodyMedium">
            Хочу посетить позже: {place.visitlater ? "да" : "нет"}
          </Text>
          <Text variant="bodyMedium">Понравилось: {place.liked ? "да" : "нет"}</Text>
          {hasCoords && (
            <Text variant="bodySmall">
              Координаты: {place.latitude!.toFixed(5)}, {place.longitude!.toFixed(5)}
            </Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => router.push(`/places/${placeId}/edit`)}>Редактировать</Button>
          {hasCoords && (
            <Button onPress={handleOpenMap}>Открыть на карте</Button>
          )}
          <Button textColor="#b00020" onPress={handleDeletePlace}>Удалить</Button>
        </Card.Actions>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Фотографии</Text>
      <View style={styles.photoRow}>
        {photos.map((photo) => (
          <View key={photo.id} style={styles.photoWrap}>
            <Image source={{ uri: photo.path }} style={styles.thumb} />
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleDeletePhoto(photo)}
              style={styles.deletePhotoBtn}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.addPhoto} onPress={handleAddPhoto}>
          <Text>+ Фото</Text>
        </TouchableOpacity>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>Контакты</Text>
      {contacts.map((c) => (
        <List.Item
          key={c.id}
          title={c.kind}
          description={c.value}
          right={(props) => (
            <IconButton
              {...props}
              icon="delete"
              onPress={() => handleDeleteContact(c.id)}
            />
          )}
        />
      ))}
      <View style={styles.newContact}>
        <TextInput
          label="Тип (телефон, email…)"
          value={newContactKind}
          onChangeText={setNewContactKind}
          mode="outlined"
          dense
          style={styles.contactInput}
        />
        <TextInput
          label="Значение"
          value={newContactValue}
          onChangeText={setNewContactValue}
          mode="outlined"
          dense
          style={styles.contactInput}
        />
        <Button mode="outlined" onPress={handleAddContact} compact>
          Добавить
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  card: { marginBottom: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24 },
  sectionTitle: { marginBottom: 8, marginTop: 8 },
  photoRow: { flexDirection: "row", flexWrap: "wrap", marginBottom: 16 },
  photoWrap: { position: "relative", marginRight: 8, marginBottom: 8 },
  thumb: { width: 80, height: 80, borderRadius: 8 },
  deletePhotoBtn: { position: "absolute", top: -8, right: -8, margin: 0 },
  addPhoto: {
    width: 80,
    height: 80,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  newContact: { marginTop: 8 },
  contactInput: { marginBottom: 8 },
});
