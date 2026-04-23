import { z } from "zod";

export const saveRecipeSchema = z.object({
  name: z.string().min(3).max(120),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  dietaryTags: z
    .array(
      z.enum([
        "balanced",
        "high-protein",
        "vegetarian",
        "vegan",
        "pescatarian",
        "keto",
      ]),
    )
    .min(1),
  ingredients: z
    .array(
      z.object({
        name: z.string().min(1),
        quantity: z.number().positive(),
        unit: z.string().min(1),
        category: z.string().min(1),
        estimatedCost: z.number().min(0),
      }),
    )
    .min(1),
  steps: z.array(z.string().min(5)).min(1),
  cookingTime: z.number().int().min(1).max(240),
  nutrition: z.object({
    calories: z.number().min(50).max(2000),
    protein: z.number().min(0).max(250),
    carbs: z.number().min(0).max(300),
    fats: z.number().min(0).max(200),
  }),
  estimatedCost: z.number().min(0).max(100),
  notes: z.string().max(280).optional(),
});
