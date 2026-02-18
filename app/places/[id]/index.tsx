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
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
      Alert.alert(t("common.error"), t("places.alerts.noGalleryAccess"));
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
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("places.alerts.addPhotoError"));
    }
  };

  const handleDeletePhoto = async (photo: PlacePhoto) => {
    try {
      await deletePlacePhoto(photo.id);
      await deletePhotoFile(photo.path);
      load();
    } catch (e) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("places.alerts.deletePhotoError"));
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
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("places.alerts.addContactError"));
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    try {
      await deletePlaceContact(contactId);
      load();
    } catch (e) {
      Alert.alert(t("common.error"), e instanceof Error ? e.message : t("places.alerts.deleteContactError"));
    }
  };

  const handleDeletePlace = () => {
    Alert.alert(
      t("places.detail.deleteConfirm"),
      t("places.detail.deleteConfirmMessage", { name: place?.name }),
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: t("common.delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deletePlace(placeId);
              router.replace("/places");
            } catch (e) {
              Alert.alert(t("common.error"), e instanceof Error ? e.message : t("places.alerts.deletePlaceError"));
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
        <Text>{t("places.detail.notFound")}</Text>
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
            {t("places.detail.visitLater")}: {place.visitlater ? t("common.yes") : t("common.no")}
          </Text>
          <Text variant="bodyMedium">{t("places.detail.liked")}: {place.liked ? t("common.yes") : t("common.no")}</Text>
          {hasCoords && (
            <Text variant="bodySmall">
              {t("places.detail.coords")}: {place.latitude!.toFixed(5)}, {place.longitude!.toFixed(5)}
            </Text>
          )}
        </Card.Content>
        <Card.Actions>
          <Button onPress={() => router.push(`/places/${placeId}/edit`)}>{t("places.detail.edit")}</Button>
          {hasCoords && (
            <Button onPress={handleOpenMap}>{t("places.detail.openOnMap")}</Button>
          )}
          <Button textColor="#b00020" onPress={handleDeletePlace}>{t("places.detail.delete")}</Button>
        </Card.Actions>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>{t("places.detail.photos")}</Text>
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
          <Text>{t("places.detail.addPhoto")}</Text>
        </TouchableOpacity>
      </View>

      <Text variant="titleMedium" style={styles.sectionTitle}>{t("places.detail.contacts")}</Text>
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
          label={t("places.detail.contactKind")}
          value={newContactKind}
          onChangeText={setNewContactKind}
          mode="outlined"
          dense
          style={styles.contactInput}
        />
        <TextInput
          label={t("places.detail.contactValue")}
          value={newContactValue}
          onChangeText={setNewContactValue}
          mode="outlined"
          dense
          style={styles.contactInput}
        />
        <Button mode="outlined" onPress={handleAddContact} compact>
          {t("places.detail.add")}
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
