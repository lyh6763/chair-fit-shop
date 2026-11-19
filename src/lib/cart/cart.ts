import { getChair } from "@/data/chairs";
import type { CartLine } from "./types";

export const MAX_QUANTITY = 99;

export function cartLineKey({ chairSlug, colorSlug }: CartLine) {
  return `${chairSlug}:${colorSlug}`;
}

export function parseCartLine(value: unknown): CartLine | null {
  if (typeof value !== "object" || value === null) return null;
  const { chairSlug, colorSlug, quantity } = value as Partial<CartLine>;
  if (typeof chairSlug !== "string" || typeof colorSlug !== "string") return null;
  if (typeof quantity !== "number" || !Number.isSafeInteger(quantity) || quantity < 1) return null;
  if (!getChair(chairSlug)?.colors.some((color) => color.slug === colorSlug)) return null;
  return { chairSlug, colorSlug, quantity: Math.min(quantity, MAX_QUANTITY) };
}

export function parseCart(value: unknown): CartLine[] | null {
  if (!Array.isArray(value)) return null;
  const lines = new Map<string, CartLine>();
  for (const item of value) {
    const line = parseCartLine(item);
    if (!line) continue;
    const key = cartLineKey(line);
    const previous = lines.get(key)?.quantity ?? 0;
    lines.set(key, { ...line, quantity: Math.min(previous + line.quantity, MAX_QUANTITY) });
  }
  return [...lines.values()];
}

export function cartItems(lines: readonly CartLine[]) {
  return lines.flatMap((line) => {
    const chair = getChair(line.chairSlug);
    const color = chair?.colors.find(({ slug }) => slug === line.colorSlug);
    return chair && color ? [{ line, chair, color, subtotal: chair.price * line.quantity }] : [];
  });
}
