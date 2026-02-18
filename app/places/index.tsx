import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { FAB, List, Text, useTheme } from "react-native-paper";
import { useFocusEffect, useRouter } from "expo-router";
import { getAllPlaces } from "@/lib/places";
import type { Place } from "@/lib/types";

export default function PlacesListScreen() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const theme = useTheme();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPlaces();
      setPlaces(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.centered}>
          <Text>Загрузка...</Text>
        </View>
      ) : places.length === 0 ? (
        <View style={styles.centered}>
          <Text variant="bodyLarge">Нет мест. Добавьте первое.</Text>
        </View>
      ) : (
        <List.Section>
          {places.map((place) => (
            <List.Item
              key={place.id}
              title={place.name}
              description={place.description ? place.description.slice(0, 60) + (place.description.length > 60 ? "…" : "") : undefined}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={place.visitlater ? "map-marker-outline" : "map-marker"}
                />
              )}
              right={(props) => place.liked ? <List.Icon {...props} icon="heart" color={theme.colors.error} /> : null}
              onPress={() => router.push(`/places/${place.id}`)}
            />
          ))}
        </List.Section>
      )}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={() => router.push("/places/new")}
        label="Добавить место"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  fab: {
    position: "absolute",
    right: 16,
    bottom: 16,
  },
});
