import { z } from "zod";

export const preferencesSchema = z.object({
  diet: z.enum([
    "balanced",
    "high-protein",
    "vegetarian",
    "vegan",
    "pescatarian",
    "keto",
  ]),
  dailyCalories: z.number().min(1200).max(5000),
  proteinTarget: z.number().min(30).max(350),
  carbsTarget: z.number().min(20).max(500),
  fatTarget: z.number().min(20).max(200),
  goal: z.enum(["maintain", "lose", "gain", "performance"]),
  weeklyBudget: z.number().min(30).max(700),
  householdSize: z.number().int().min(1).max(8),
  preferredMealTypes: z
    .array(z.enum(["breakfast", "lunch", "dinner", "snack"]))
    .min(1)
    .max(4),
  dislikedIngredients: z.array(z.string().max(40)).max(25),
  likedIngredients: z.array(z.string().max(40)).max(25),
  allergies: z.array(z.string().max(40)).max(15),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80),
  preferences: preferencesSchema,
});
