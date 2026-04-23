import { z } from "zod";

export const createMealPlanSchema = z.object({
  startDate: z.string().min(10),
  days: z.number().int().min(1).max(7).default(7),
  strategy: z.enum(["smart", "empty"]).default("smart"),
});

export const mealPlanActionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("update_servings"),
    dayId: z.string(),
    mealId: z.string(),
    servings: z.number().min(0.5).max(4),
  }),
  z.object({
    action: z.literal("swap_recipe"),
    dayId: z.string(),
    mealId: z.string(),
  }),
  z.object({
    action: z.literal("regenerate_meal"),
    dayId: z.string(),
    mealId: z.string(),
  }),
  z.object({
    action: z.literal("add_recipe_to_day"),
    dayId: z.string(),
    mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
    recipeId: z.string(),
  }),
  z.object({
    action: z.literal("remove_meal"),
    dayId: z.string(),
    mealId: z.string(),
  }),
]);
