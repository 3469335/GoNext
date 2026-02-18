import { Linking, Platform } from "react-native";

/**
 * Открыть место в приложении карт или навигаторе по координатам (Decimal Degrees).
 * Использует geo: URI или Google Maps URL в зависимости от платформы.
 */
export function openPlaceOnMap(latitude: number, longitude: number): void {
  const lat = latitude.toFixed(6);
  const lon = longitude.toFixed(6);
  const url =
    Platform.OS === "android"
      ? `geo:${lat},${lon}?q=${lat},${lon}`
      : Platform.OS === "ios"
        ? `maps:?ll=${lat},${lon}&q=${lat},${lon}`
        : `https://www.google.com/maps?q=${lat},${lon}`;
  Linking.openURL(url).catch((err) =>
    console.warn("Could not open map:", err)
  );
}
