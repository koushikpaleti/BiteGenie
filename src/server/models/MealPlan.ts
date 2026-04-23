import { Schema, model, models } from "mongoose";

const nutritionSchema = new Schema(
  {
    calories: Number,
    protein: Number,
    carbs: Number,
    fats: Number,
  },
  { _id: false },
);

const mealSchema = new Schema(
  {
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
    },
    recipeId: {
      type: Schema.Types.ObjectId,
      ref: "Recipe",
      required: true,
      index: true,
    },
    servings: { type: Number, required: true, default: 1 },
    nutrition: { type: nutritionSchema, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
  },
  { _id: true },
);

const daySchema = new Schema(
  {
    date: { type: String, required: true },
    meals: { type: [mealSchema], default: [] },
    totalNutrition: { type: nutritionSchema, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
  },
  { _id: true },
);

const mealPlanSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    startDate: { type: String, required: true, index: true },
    endDate: { type: String, required: true },
    days: { type: [daySchema], default: [] },
    totalNutrition: { type: nutritionSchema, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
    reuseSuggestions: { type: [String], default: [] },
    insights: { type: [String], default: [] },
  },
  { timestamps: true },
);

mealPlanSchema.index({ userId: 1, startDate: -1 });

export const MealPlanModel = models.MealPlan || model("MealPlan", mealPlanSchema);
