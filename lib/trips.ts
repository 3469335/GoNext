import { getDb } from "./db";
import type { Trip, TripInsert, TripPlace, TripPlaceInsert } from "./types";

function getDbOrThrow() {
  const db = getDb();
  if (!db) throw new Error("База данных недоступна (запустите приложение в Expo Go или dev build).");
  return db;
}

function rowToTrip(row: Record<string, unknown>): Trip {
  return {
    id: row.id as number,
    title: (row.title as string) ?? "",
    description: (row.description as string) ?? "",
    startDate: (row.startDate as string) ?? "",
    endDate: (row.endDate as string) ?? "",
    createdAt: (row.createdAt as string) ?? "",
    current: (row.current as number) === 1,
  };
}

function rowToTripPlace(row: Record<string, unknown>): TripPlace {
  return {
    id: row.id as number,
    tripId: row.tripId as number,
    placeId: row.placeId as number,
    order: (row.order as number) ?? 0,
    visited: (row.visited as number) === 1,
    visitDate: (row.visitDate as string) ?? null,
    notes: (row.notes as string) ?? "",
  };
}

export async function getAllTrips(): Promise<Trip[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.getAllAsync<Record<string, unknown>>(
    "SELECT * FROM trips ORDER BY startDate DESC"
  );
  return rows.map(rowToTrip);
}

export async function getTripById(id: number): Promise<Trip | null> {
  const db = getDb();
  if (!db) return null;
  const row = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM trips WHERE id = ?",
    id
  );
  return row ? rowToTrip(row) : null;
}

export async function getCurrentTrip(): Promise<Trip | null> {
  const db = getDb();
  if (!db) return null;
  const row = await db.getFirstAsync<Record<string, unknown>>(
    "SELECT * FROM trips WHERE current = 1 LIMIT 1"
  );
  return row ? rowToTrip(row) : null;
}

export async function createTrip(data: TripInsert): Promise<number> {
  const db = getDbOrThrow();
  if (data.current) {
    await db.runAsync("UPDATE trips SET current = 0");
  }
  const result = await db.runAsync(
    `INSERT INTO trips (title, description, startDate, endDate, createdAt, current)
     VALUES (?, ?, ?, ?, datetime('now'), ?)`,
    data.title,
    data.description ?? "",
    data.startDate,
    data.endDate,
    data.current ? 1 : 0
  );
  return result.lastInsertRowId;
}

export async function updateTrip(
  id: number,
  data: Partial<TripInsert>
): Promise<void> {
  const db = getDbOrThrow();
  if (data.current) {
    await db.runAsync("UPDATE trips SET current = 0 WHERE id != ?", id);
  }
  const trip = await getTripById(id);
  if (!trip) return;
  await db.runAsync(
    `UPDATE trips SET
       title = ?, description = ?, startDate = ?, endDate = ?, current = ?
     WHERE id = ?`,
    data.title ?? trip.title,
    data.description ?? trip.description,
    data.startDate ?? trip.startDate,
    data.endDate ?? trip.endDate,
    data.current !== undefined ? (data.current ? 1 : 0) : (trip.current ? 1 : 0),
    id
  );
}

export async function setCurrentTrip(id: number): Promise<void> {
  await updateTrip(id, { current: true });
}

export async function deleteTrip(id: number): Promise<void> {
  const db = getDbOrThrow();
  await db.runAsync("DELETE FROM trips WHERE id = ?", id);
}

// --- Trip places ---

export async function getTripPlaces(tripId: number): Promise<TripPlace[]> {
  const db = getDb();
  if (!db) return [];
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM trip_places WHERE tripId = ? ORDER BY "order" ASC',
    tripId
  );
  return rows.map(rowToTripPlace);
}

export async function addPlaceToTrip(data: TripPlaceInsert): Promise<number> {
  const db = getDbOrThrow();
  const result = await db.runAsync(
    `INSERT INTO trip_places (tripId, placeId, "order", visited, visitDate, notes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    data.tripId,
    data.placeId,
    data.order ?? 0,
    data.visited ? 1 : 0,
    data.visitDate ?? null,
    data.notes ?? ""
  );
  return result.lastInsertRowId;
}

export async function updateTripPlace(
  id: number,
  data: Partial<TripPlaceInsert>
): Promise<void> {
  const db = getDbOrThrow();
  const updates: string[] = [];
  const values: unknown[] = [];
  if (data.order !== undefined) {
    updates.push('"order" = ?');
    values.push(data.order);
  }
  if (data.visited !== undefined) {
    updates.push("visited = ?");
    values.push(data.visited ? 1 : 0);
  }
  if (data.visitDate !== undefined) {
    updates.push("visitDate = ?");
    values.push(data.visitDate);
  }
  if (data.notes !== undefined) {
    updates.push("notes = ?");
    values.push(data.notes);
  }
  if (updates.length === 0) return;
  values.push(id);
  await db.runAsync(
    `UPDATE trip_places SET ${updates.join(", ")} WHERE id = ?`,
    ...values
  );
}

export async function removePlaceFromTrip(tripPlaceId: number): Promise<void> {
  const db = getDbOrThrow();
  await db.runAsync("DELETE FROM trip_places WHERE id = ?", tripPlaceId);
}
