import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";

export const ORIENTATION_STORAGE_KEY = "@gonext_orientation";

export type OrientationMode = "portrait" | "landscape";

/** Множитель размера шрифта в альбомном режиме */
export const LANDSCAPE_FONT_SCALE = 1.2;

type OrientationContextValue = {
  orientation: OrientationMode;
  setOrientation: (mode: OrientationMode) => Promise<void>;
  fontScale: number;
};

const OrientationContext = createContext<OrientationContextValue | null>(null);

async function lockOrientation(mode: OrientationMode) {
  try {
    if (mode === "landscape") {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  } catch (e) {
    console.warn("Screen orientation lock failed:", e);
  }
}

export function OrientationProvider({ children }: { children: React.ReactNode }) {
  const [orientation, setOrientationState] = useState<OrientationMode>("portrait");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(ORIENTATION_STORAGE_KEY).then((saved) => {
      if (saved === "portrait" || saved === "landscape") {
        setOrientationState(saved);
        lockOrientation(saved);
      }
      setLoaded(true);
    });
  }, []);

  const setOrientation = useCallback(async (mode: OrientationMode) => {
    setOrientationState(mode);
    await AsyncStorage.setItem(ORIENTATION_STORAGE_KEY, mode);
    await lockOrientation(mode);
  }, []);

  const fontScale = orientation === "landscape" ? LANDSCAPE_FONT_SCALE : 1;
  const value: OrientationContextValue = loaded
    ? { orientation, setOrientation, fontScale }
    : { orientation: "portrait", setOrientation, fontScale: 1 };

  return (
    <OrientationContext.Provider value={value}>
      {children}
    </OrientationContext.Provider>
  );
}

export function useOrientation(): OrientationContextValue {
  const ctx = useContext(OrientationContext);
  if (!ctx) throw new Error("useOrientation must be used within OrientationProvider");
  return ctx;
}
