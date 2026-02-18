import type { MD3Theme } from "react-native-paper";

function scaleFontObject(obj: Record<string, unknown>, scale: number): Record<string, unknown> {
  const next: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val != null && typeof val === "object" && !Array.isArray(val)) {
      const v = val as Record<string, unknown>;
      if (typeof v.fontSize === "number") {
        next[key] = {
          ...v,
          fontSize: Math.round(v.fontSize * scale),
          ...(typeof v.lineHeight === "number" && { lineHeight: Math.round(v.lineHeight * scale) }),
        };
      } else {
        next[key] = scaleFontObject(v as Record<string, unknown>, scale);
      }
    } else {
      next[key] = val;
    }
  }
  return next;
}

/**
 * Возвращает копию темы Paper с масштабированными шрифтами (fontSize, lineHeight).
 */
export function scaleThemeFonts(theme: MD3Theme, scale: number): MD3Theme {
  if (scale === 1) return theme;
  return {
    ...theme,
    fonts: scaleFontObject(theme.fonts as unknown as Record<string, unknown>, scale) as MD3Theme["fonts"],
  };
}
