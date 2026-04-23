import { Schema, model, models } from "mongoose";

const groceryItemSchema = new Schema(
  {
    key: { type: String, required: true },
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    category: { type: String, required: true, index: true },
    checked: { type: Boolean, default: false },
  },
  { _id: false },
);

const groceryListSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    linkedMealPlanId: {
      type: Schema.Types.ObjectId,
      ref: "MealPlan",
      required: true,
      unique: true,
    },
    items: {
      type: [groceryItemSchema],
      default: [],
    },
  },
  { timestamps: true },
);

groceryListSchema.index({ userId: 1, linkedMealPlanId: 1 });

export const GroceryListModel =
  models.GroceryList || model("GroceryList", groceryListSchema);
