import { describe, expect, it } from "vitest";
import { cartItems, MAX_QUANTITY, parseCart } from "./cart";

describe("cart data", () => {
  const desk = { chairSlug: "desk-mesh", colorSlug: "white", quantity: 1 };
  const study = { chairSlug: "study-fabric", colorSlug: "blue", quantity: 1 };

  it("combines identical options and ignores invalid products, colors, and quantities", () => {
    expect(parseCart([
      desk,
      { ...desk, quantity: 3 },
      { ...desk, colorSlug: "black" },
      { ...desk, chairSlug: "missing" },
      { ...desk, colorSlug: "gray" },
      { ...study, quantity: 0 },
      { ...study, quantity: 1.5 },
      { ...study, quantity: "1" },
      null,
    ])).toEqual([{ ...desk, quantity: 4 }, { ...desk, colorSlug: "black" }]);
    expect(parseCart({ items: [desk] })).toBeNull();
  });

  it("caps stored quantities per option", () => {
    expect(parseCart([{ ...desk, quantity: 100 }, desk])).toEqual([{ ...desk, quantity: MAX_QUANTITY }]);
  });

  it("uses the current catalog prices and retains the selected colors", () => {
    const lines = parseCart([{ ...desk, quantity: 2, price: 1 }, study]) ?? [];
    const items = cartItems(lines);
    expect(items.map(({ color, subtotal }) => [color.name, subtotal])).toEqual([
      ["화이트", 1098000],
      ["블루", 329000],
    ]);
    expect(items.reduce((total, item) => total + item.subtotal, 0)).toBe(1427000);
  });
});
