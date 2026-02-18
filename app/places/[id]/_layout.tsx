import { Stack } from "expo-router";

export default function PlaceIdLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Место" }} />
      <Stack.Screen name="edit" options={{ title: "Редактировать" }} />
    </Stack>
  );
}
