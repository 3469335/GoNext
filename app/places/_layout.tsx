import { Stack } from "expo-router";

export default function PlacesLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Места" }} />
      <Stack.Screen name="new" options={{ title: "Новое место" }} />
      <Stack.Screen name="[id]" options={{ title: "Место" }} />
    </Stack>
  );
}
