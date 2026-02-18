/**
 * Вычисление контрастного цвета (белый или чёрный) для текста на фоне.
 */
function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function getOnPrimary(primaryHex: string): string {
  return luminance(primaryHex) < 0.5 ? "#ffffff" : "#000000";
}

/**
 * Смешивание двух цветов (hex). ratio 0 = color1, 1 = color2.
 */
function mixHex(hex1: string, hex2: string, ratio: number): string {
  const parse = (h: string) => {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

export function getPrimaryContainer(primaryHex: string, isDark: boolean): string {
  return mixHex(primaryHex, isDark ? "#000000" : "#ffffff", isDark ? 0.7 : 0.85);
}

export function getOnPrimaryContainer(primaryHex: string, isDark: boolean): string {
  const container = getPrimaryContainer(primaryHex, isDark);
  return luminance(container) < 0.5 ? "#ffffff" : "#000000";
}
