import { Schema, model, models } from "mongoose";

const preferencesSchema = new Schema(
  {
    diet: {
      type: String,
      enum: ["balanced", "high-protein", "vegetarian", "vegan", "pescatarian", "keto"],
      default: "balanced",
    },
    dailyCalories: { type: Number, default: 2100 },
    proteinTarget: { type: Number, default: 140 },
    carbsTarget: { type: Number, default: 220 },
    fatTarget: { type: Number, default: 70 },
    goal: {
      type: String,
      enum: ["maintain", "lose", "gain", "performance"],
      default: "maintain",
    },
    weeklyBudget: { type: Number, default: 110 },
    householdSize: { type: Number, default: 1 },
    preferredMealTypes: {
      type: [String],
      default: ["breakfast", "lunch", "dinner", "snack"],
    },
    dislikedIngredients: {
      type: [String],
      default: [],
    },
    likedIngredients: {
      type: [String],
      default: [],
    },
    allergies: {
      type: [String],
      default: [],
    },
  },
  { _id: false },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
  },
  { timestamps: true },
);

export const UserModel = models.User || model("User", userSchema);
