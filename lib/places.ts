import { getDb } from "./db";
import type { Place, PlaceInsert } from "./types";

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
