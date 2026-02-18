import { Platform } from "react-native";
import { SCHEMA_SQL } from "./schema";

const DB_NAME = "gonext.db";

/** Тип БД без импорта expo-sqlite (чтобы не грузить нативный модуль на web). */
type SQLiteDatabase = import("expo-sqlite").SQLiteDatabase;

let db: SQLiteDatabase | null = null;

/**
 * Инициализация БД: открытие и применение схемы.
 * На web expo-sqlite не подключается (нет нативного модуля), возвращаем null.
 */
export async function initDatabase(): Promise<SQLiteDatabase | null> {
  if (db) return db;
  if (Platform.OS === "web") {
    return null;
  }
  try {
    const SQLite = require("expo-sqlite");
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(SCHEMA_SQL);
    return db;
  } catch (e) {
    console.warn("initDatabase failed (ExpoSQLite may be unavailable):", e);
    db = null;
    return null;
  }
}

/**
 * Получить экземпляр БД (перед вызовом должен быть выполнен initDatabase).
 * На платформах без SQLite (web) или при ошибке инициализации возвращает null.
 */
export function getDb(): SQLiteDatabase | null {
  return db;
}
