import { z } from "zod";

export const generateMealSchema = z.object({
  ingredients: z.array(z.string().min(1)).min(2).max(15),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  dietaryPreference: z.enum([
    "balanced",
    "high-protein",
    "vegetarian",
    "vegan",
    "pescatarian",
    "keto",
  ]),
  cookingTimeLimit: z.number().int().min(5).max(120).optional(),
  saveRecipe: z.boolean().optional(),
});
