import { roundTo, titleCase } from "@/lib/utils";
import type { GroceryItem, RecipeIngredient } from "@/types";

const ingredientAliases: Array<[RegExp, string]> = [
  [/\bcoriander leaves?\b|\bcilantro(?: leaves?)?\b/giu, "coriander"],
  [/\bcurd\b/giu, "yogurt"],
  [/\bgreen chillies\b|\bgreen chilies\b/giu, "green chili"],
  [/\bchillies\b|\bchilies\b/giu, "chili"],
  [/\bonions\b/giu, "onion"],
  [/\btomatoes\b/giu, "tomato"],
  [/\bpotatoes\b/giu, "potato"],
  [/\beggs\b/giu, "egg"],
  [/\bchickpeas\b|\bgarbanzo beans\b/giu, "chana"],
];

const unitAliases: Record<string, string> = {
  count: "count",
  counts: "count",
  item: "count",
  items: "count",
  piece: "count",
  pieces: "count",
  whole: "count",
  wholes: "count",
  g: "g",
  gram: "g",
  grams: "g",
  kg: "kg",
  kgs: "kg",
  kilogram: "kg",
  kilograms: "kg",
  ml: "ml",
  milliliter: "ml",
  milliliters: "ml",
  millilitre: "ml",
  millilitres: "ml",
  l: "l",
  litre: "l",
  litres: "l",
  liter: "l",
  liters: "l",
  cup: "cup",
  cups: "cup",
  tbsp: "tbsp",
  tablespoon: "tbsp",
  tablespoons: "tbsp",
  tsp: "tsp",
  teaspoon: "tsp",
  teaspoons: "tsp",
  clove: "clove",
  cloves: "clove",
  leaf: "leaf",
  leaves: "leaf",
};

function cleanIngredientName(name: string) {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

export function canonicalizeIngredientName(name: string) {
  let normalized = cleanIngredientName(name);

  ingredientAliases.forEach(([pattern, replacement]) => {
    normalized = normalized.replace(pattern, replacement);
  });

  return normalized;
}

function canonicalizeUnit(unit: string) {
  const normalized = unit.trim().toLowerCase().replace(/\./g, "");
  return unitAliases[normalized] ?? normalized;
}

export function getGroceryItemKey(item: {
  key?: string;
  name: string;
  unit: string;
}) {
  if (item.key) {
    return item.key;
  }

  return `${canonicalizeIngredientName(item.name)}:${canonicalizeUnit(item.unit)}`;
}

function normalizeQuantity(quantity: number, unit: string) {
  switch (unit) {
    case "kg":
      return { quantity: roundTo(quantity * 1000, 2), unit: "g" };
    case "l":
      return { quantity: roundTo(quantity * 1000, 2), unit: "ml" };
    case "cup":
      return { quantity: roundTo(quantity * 240, 2), unit: "ml" };
    case "tbsp":
      return { quantity: roundTo(quantity * 15, 2), unit: "ml" };
    case "tsp":
      return { quantity: roundTo(quantity * 5, 2), unit: "ml" };
    default:
      return { quantity: roundTo(quantity, 2), unit };
  }
}

export function normalizeGroceryIngredient(
  ingredient: Pick<RecipeIngredient, "name" | "quantity" | "unit" | "category">,
): GroceryItem {
  const canonicalName = canonicalizeIngredientName(ingredient.name);
  const canonicalUnit = canonicalizeUnit(ingredient.unit);
  const { quantity, unit } = normalizeQuantity(ingredient.quantity, canonicalUnit);

  return {
    key: `${canonicalName}:${unit}`,
    name: titleCase(canonicalName),
    quantity,
    unit,
    category: ingredient.category,
    checked: false,
  };
}

export function mergeCheckedState(
  nextItems: GroceryItem[],
  previousItems: Array<Partial<GroceryItem> & Pick<GroceryItem, "name" | "unit" | "checked">>,
) {
  const checkedByKey = new Map(
    previousItems.map((item) => [getGroceryItemKey(item), item.checked]),
  );

  return nextItems.map((item) => ({
    ...item,
    checked: checkedByKey.get(getGroceryItemKey(item)) ?? item.checked,
  }));
}

export function formatGroceryQuantity(quantity: number, unit: string) {
  if (unit === "g" && quantity >= 1000) {
    return `${roundTo(quantity / 1000, 2)} kg`;
  }

  if (unit === "ml" && quantity >= 1000) {
    return `${roundTo(quantity / 1000, 2)} l`;
  }

  if (unit === "count") {
    return `${roundTo(quantity, 2)}`;
  }

  return `${roundTo(quantity, 2)} ${unit}`;
}
