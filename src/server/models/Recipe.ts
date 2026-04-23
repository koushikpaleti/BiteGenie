import { Schema, model, models } from "mongoose";

const nutritionSchema = new Schema(
  {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
  },
  { _id: false },
);

const ingredientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true, index: true },
    estimatedCost: { type: Number, required: true, default: 0 },
  },
  { _id: false },
);

const recipeSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    mealType: {
      type: String,
      enum: ["breakfast", "lunch", "dinner", "snack"],
      required: true,
      index: true,
    },
    dietaryTags: {
      type: [String],
      index: true,
      default: ["balanced"],
    },
    ingredients: {
      type: [ingredientSchema],
      default: [],
    },
    steps: {
      type: [String],
      default: [],
    },
    cookingTime: { type: Number, required: true },
    nutrition: { type: nutritionSchema, required: true },
    estimatedCost: { type: Number, required: true, default: 0 },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    source: {
      type: String,
      enum: ["seed", "ai", "user"],
      default: "seed",
      index: true,
    },
    likedBy: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    cachedKey: {
      type: String,
      default: null,
      index: true,
    },
    notes: { type: String, default: "" },
  },
  { timestamps: true },
);

recipeSchema.index({ mealType: 1, dietaryTags: 1 });
recipeSchema.index({ name: "text", "ingredients.name": "text" });

export const RecipeModel = models.Recipe || model("Recipe", recipeSchema);
