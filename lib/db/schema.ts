/**
 * Схема БД: таблицы и индексы для GoNext
 */

export const SCHEMA_SQL = `
-- Места (не привязаны к поездке)
CREATE TABLE IF NOT EXISTS places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  visitlater INTEGER NOT NULL DEFAULT 1,
  liked INTEGER NOT NULL DEFAULT 0,
  latitude REAL,
  longitude REAL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Фото места
CREATE TABLE IF NOT EXISTS place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placeId INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Контакты, связанные с местом
CREATE TABLE IF NOT EXISTS place_contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  placeId INTEGER NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  value TEXT NOT NULL
);

-- Поездки
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  startDate TEXT NOT NULL,
  endDate TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  current INTEGER NOT NULL DEFAULT 0
);

-- Место в поездке (с фактом посещения)
CREATE TABLE IF NOT EXISTS trip_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripId INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  placeId INTEGER NOT NULL REFERENCES places(id),
  "order" INTEGER NOT NULL DEFAULT 0,
  visited INTEGER NOT NULL DEFAULT 0,
  visitDate TEXT,
  notes TEXT NOT NULL DEFAULT ''
);

-- Фото по месту в поездке
CREATE TABLE IF NOT EXISTS trip_place_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tripPlaceId INTEGER NOT NULL REFERENCES trip_places(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_place_photos_placeId ON place_photos(placeId);
CREATE INDEX IF NOT EXISTS idx_place_contacts_placeId ON place_contacts(placeId);
CREATE INDEX IF NOT EXISTS idx_trip_places_tripId ON trip_places(tripId);
CREATE INDEX IF NOT EXISTS idx_trip_places_placeId ON trip_places(placeId);
CREATE INDEX IF NOT EXISTS idx_trip_place_photos_tripPlaceId ON trip_place_photos(tripPlaceId);
CREATE INDEX IF NOT EXISTS idx_trips_current ON trips(current);
`;
