import { Schema, model, models } from "mongoose";

const generatedRecipeSchema = new Schema(
  {
    name: { type: String, required: true },
    ingredients: { type: [String], default: [] },
    steps: { type: [String], default: [] },
    cooking_time: { type: Number, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
  },
  { _id: false },
);

const generatedMealSchema = new Schema(
  {
    cacheKey: { type: String, required: true, unique: true, index: true },
    inputIngredients: { type: [String], required: true, index: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
      index: true,
    },
    dietaryPreference: {
      type: String,
      enum: ["balanced", "high-protein", "vegetarian", "vegan", "pescatarian", "keto"],
      required: true,
      index: true,
    },
    cookingTimeLimit: { type: Number, default: null },
    generatedRecipe: { type: generatedRecipeSchema, required: true },
  },
  { timestamps: true },
);

export const GeneratedMealModel =
  models.GeneratedMeal || model("GeneratedMeal", generatedMealSchema);
