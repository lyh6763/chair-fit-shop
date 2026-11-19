import { createStorageStore } from "@/lib/storage";
import { cartLineKey, MAX_QUANTITY, parseCart, parseCartLine } from "./cart";
import type { CartLine } from "./types";

export const cartStore = createStorageStore("chair-fit-shop:cart", "local", parseCart);

export const cartActions = {
  add(line: CartLine) {
    const candidate = parseCartLine(line);
    if (!candidate || candidate.quantity !== line.quantity) return false;
    const current = cartStore.get() ?? [];
    const key = cartLineKey(candidate);
    const previous = current.find((item) => cartLineKey(item) === key)?.quantity ?? 0;
    if (previous + candidate.quantity > MAX_QUANTITY) return false;
    cartStore.set(parseCart([...current, candidate]));
    return true;
  },

  setQuantity(key: string, quantity: number) {
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return;
    cartStore.set((cartStore.get() ?? []).map((line) => cartLineKey(line) === key ? { ...line, quantity } : line));
  },

  remove(key: string) {
    cartStore.set((cartStore.get() ?? []).filter((line) => cartLineKey(line) !== key));
  },
};
