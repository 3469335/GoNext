import * as FileSystem from "expo-file-system";

const PLACES_PHOTOS_DIR = "places_photos";

/**
 * Копирует файл по URI (например, из expo-image-picker) в хранилище приложения
 * и возвращает путь для сохранения в БД.
 */
export async function savePlacePhotoFromUri(
  placeId: number,
  sourceUri: string
): Promise<string> {
  const dir = `${FileSystem.documentDirectory}${PLACES_PHOTOS_DIR}`;
  const exists = await FileSystem.getInfoAsync(dir);
  if (!exists.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
  const ext = sourceUri.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `place_${placeId}_${Date.now()}.${ext}`;
  const destPath = `${dir}/${filename}`;
  await FileSystem.copyAsync({ from: sourceUri, to: destPath });
  return destPath;
}

/**
 * Удаляет файл по пути (при удалении фото из БД можно вызвать для очистки).
 */
export async function deletePhotoFile(path: string): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) await FileSystem.deleteAsync(path);
  } catch {
    // ignore
  }
}
