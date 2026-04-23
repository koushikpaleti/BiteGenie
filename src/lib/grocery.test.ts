import { describe, expect, it } from "vitest";

import {
  formatGroceryQuantity,
  mergeCheckedState,
  normalizeGroceryIngredient,
} from "@/lib/grocery";

describe("normalizeGroceryIngredient", () => {
  it("normalizes aliases and converts units into merge-friendly base units", () => {
    const normalized = normalizeGroceryIngredient({
      name: "Cilantro Leaves",
      quantity: 1,
      unit: "cup",
      category: "produce",
      estimatedCost: 0,
    });

    expect(normalized).toMatchObject({
      key: "coriander:ml",
      name: "Coriander",
      quantity: 240,
      unit: "ml",
      checked: false,
    });
  });
});

describe("mergeCheckedState", () => {
  it("preserves checked state across regenerated lists", () => {
    const nextItems = [
      normalizeGroceryIngredient({
        name: "Onions",
        quantity: 1,
        unit: "kg",
        category: "produce",
        estimatedCost: 0,
      }),
      normalizeGroceryIngredient({
        name: "Paneer",
        quantity: 250,
        unit: "g",
        category: "protein",
        estimatedCost: 0,
      }),
    ];

    const merged = mergeCheckedState(nextItems, [
      {
        name: "Onion",
        unit: "g",
        checked: true,
      },
    ]);

    expect(merged[0]?.checked).toBe(true);
    expect(merged[1]?.checked).toBe(false);
  });
});

describe("formatGroceryQuantity", () => {
  it("upscales large normalized units into nicer display units", () => {
    expect(formatGroceryQuantity(1500, "g")).toBe("1.5 kg");
    expect(formatGroceryQuantity(1250, "ml")).toBe("1.25 l");
    expect(formatGroceryQuantity(6, "count")).toBe("6");
  });
});
