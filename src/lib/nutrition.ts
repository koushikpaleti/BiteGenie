import type { NutritionValues } from "@/types";

import { roundTo } from "@/lib/utils";

export const emptyNutrition = (): NutritionValues => ({
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
});

export function multiplyNutrition(nutrition: NutritionValues, servings: number) {
  return {
    calories: roundTo(nutrition.calories * servings),
    protein: roundTo(nutrition.protein * servings),
    carbs: roundTo(nutrition.carbs * servings),
    fats: roundTo(nutrition.fats * servings),
  };
}

export function sumNutrition(items: NutritionValues[]) {
  return items.reduce(
    (accumulator, current) => ({
      calories: roundTo(accumulator.calories + current.calories),
      protein: roundTo(accumulator.protein + current.protein),
      carbs: roundTo(accumulator.carbs + current.carbs),
      fats: roundTo(accumulator.fats + current.fats),
    }),
    emptyNutrition(),
  );
}
