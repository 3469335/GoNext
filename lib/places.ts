import { getDb } from "./db";
import type { Place, PlaceInsert, PlacePhoto, PlaceContact } from "./types";

function getDbOrThrow() {
  const db = getDb();
  if (!db) throw new Error("База данных недоступна (запустите приложение в Expo Go или dev build).");
  return db;
}

function rowToPlace(row: Record<string, unknown>): Place {
  return {
    id: row.id as number,
    name: (row.name as string) ?? "",
    description: (row.description as string) ?? "",
    visitlater: (row.visitlater as number) === 1,
    liked: (row.liked as number) === 1,
    latitude: (row.latitude as number) ?? null,
    longitude: (row.longitude as number) ?? null,
    createdAt: (row.createdAt as string) ?? "",
  };
}

export async function getAllPlaces(): Promise<Place[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM places ORDER BY createdAt DESC"
  );
  return rows.map(rowToPlace);
}

export async function getPlaceById(id: number): Promise<Place | null> {
  const db = getDb();
  if (!db) return null;
  const row = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM places WHERE id = ?",
    id
  );
  return row ? rowToPlace(row) : null;
}

export async function createPlace(data: PlaceInsert): Promise<number> {
  const db = getDbOrThrow();
  const result = await db.runAsync(
    `INSERT INTO places (name, description, visitlater, liked, latitude, longitude, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    data.name,
    data.description ?? "",
    data.visitlater ? 1 : 0,
    data.liked ? 1 : 0,
    data.latitude ?? null,
    data.longitude ?? null
  );
  return result.lastInsertRowId;
}

export async function updatePlace(
  id: number,
  data: Partial<PlaceInsert>
): Promise<void> {
  const db = getDbOrThrow();
  await db.runAsync(
    `UPDATE places SET
       name = ?, description = ?, visitlater = ?, liked = ?,
       latitude = ?, longitude = ?
     WHERE id = ?`,
    data.name ?? "",
    data.description ?? "",
    data.visitlater ? 1 : 0,
    data.liked ? 1 : 0,
    data.latitude ?? null,
    data.longitude ?? null,
    id
  );
}

export async function deletePlace(id: number): Promise<void> {
  const db = getDbOrThrow();
  await db.runAsync("DELETE FROM places WHERE id = ?", id);
}

// --- Place photos ---

function rowToPlacePhoto(row: Record<string, unknown>): PlacePhoto {
  return {
    id: row.id as number,
    placeId: row.placeId as number,
    path: (row.path as string) ?? "",
    order: (row.order as number) ?? 0,
  };
}

export async function getPlacePhotos(placeId: number): Promise<PlacePhoto[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM place_photos WHERE placeId = ? ORDER BY "order" ASC, id ASC',
    placeId
  );
  return rows.map(rowToPlacePhoto);
}

export async function addPlacePhoto(
  placeId: number,
  path: string,
  order?: number
): Promise<number> {
  const db = getDbOrThrow();
  const nextOrder = order ?? (await getPlacePhotos(placeId)).length;
  const result = await db.runAsync(
    'INSERT INTO place_photos (placeId, path, "order") VALUES (?, ?, ?)',
    placeId,
    path,
    nextOrder
  );
  return result.lastInsertRowId;
}

export async function deletePlacePhoto(id: number): Promise<void> {
  const db = getDbOrThrow();
  await db.runAsync("DELETE FROM place_photos WHERE id = ?", id);
}

// --- Place contacts ---

function rowToPlaceContact(row: Record<string, unknown>): PlaceContact {
  return {
    id: row.id as number,
    placeId: row.placeId as number,
    kind: (row.kind as string) ?? "",
    value: (row.value as string) ?? "",
  };
}

export async function getPlaceContacts(placeId: number): Promise<PlaceContact[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM place_contacts WHERE placeId = ? ORDER BY id ASC",
    placeId
  );
  return rows.map(rowToPlaceContact);
}

export async function addPlaceContact(
  placeId: number,
  kind: string,
  value: string
): Promise<number> {
  const db = getDbOrThrow();
  const result = await db.runAsync(
    "INSERT INTO place_contacts (placeId, kind, value) VALUES (?, ?, ?)",
    placeId,
    kind,
    value
  );
  return result.lastInsertRowId;
}

export async function updatePlaceContact(
  id: number,
  data: { kind?: string; value?: string }
): Promise<void> {
  const db = getDbOrThrow();
  if (data.kind !== undefined && data.value !== undefined) {
    await db.runAsync(
      "UPDATE place_contacts SET kind = ?, value = ? WHERE id = ?",
      data.kind,
      data.value,
      id
    );
  } else if (data.kind !== undefined) {
    await db.runAsync("UPDATE place_contacts SET kind = ? WHERE id = ?", data.kind, id);
  } else if (data.value !== undefined) {
    await db.runAsync("UPDATE place_contacts SET value = ? WHERE id = ?", data.value, id);
  }
}

export async function deletePlaceContact(id: number): Promise<void> {
  const db = getDbOrThrow();
  await db.runAsync("DELETE FROM place_contacts WHERE id = ?", id);
}
