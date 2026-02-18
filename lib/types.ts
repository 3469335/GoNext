/**
 * Типы сущностей приложения GoNext (по PROJECT.md)
 */

export interface Place {
  id: number;
  name: string;
  description: string;
  visitlater: boolean;
  liked: boolean;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

export interface PlacePhoto {
  id: number;
  placeId: number;
  path: string;
  order: number;
}

export interface PlaceContact {
  id: number;
  placeId: number;
  kind: string;
  value: string;
}

export interface Trip {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  current: boolean;
}

export interface TripPlace {
  id: number;
  tripId: number;
  placeId: number;
  order: number;
  visited: boolean;
  visitDate: string | null;
  notes: string;
}

export interface TripPlacePhoto {
  id: number;
  tripPlaceId: number;
  path: string;
  order: number;
}

/** Для вставки/обновления (без id и без createdAt где не нужны) */
export type PlaceInsert = Omit<Place, "id" | "createdAt"> & {
  id?: number;
  createdAt?: string;
};

export type TripInsert = Omit<Trip, "id" | "createdAt"> & {
  id?: number;
  createdAt?: string;
};

export type TripPlaceInsert = Omit<TripPlace, "id"> & { id?: number };
