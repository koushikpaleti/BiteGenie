import { Types } from "mongoose";

import {
  getGroceryItemKey,
  mergeCheckedState,
  normalizeGroceryIngredient,
} from "@/lib/grocery";
import { connectToDatabase } from "@/lib/db";
import { roundTo } from "@/lib/utils";
import { GroceryListModel } from "@/server/models/GroceryList";
import { RecipeModel } from "@/server/models/Recipe";
import type {
  AuthUser,
  GroceryItem,
  GroceryListPayload,
  MealPlanPayload,
  RecipeIngredient,
} from "@/types";

async function buildItems(plan: MealPlanPayload, householdSize: number) {
  const recipeIds = plan.days.flatMap((day) => day.meals.map((meal) => meal.recipeId));
  const recipes = await RecipeModel.find({
    _id: { $in: recipeIds.map((id) => new Types.ObjectId(id)) },
  }).lean();
  const recipeMap = new Map(recipes.map((recipe) => [recipe._id.toString(), recipe]));
  const merged = new Map<string, GroceryItem>();

  plan.days.forEach((day) => {
    day.meals.forEach((meal) => {
      const recipe = recipeMap.get(meal.recipeId);

      if (!recipe) {
        return;
      }

      recipe.ingredients.forEach((ingredient: RecipeIngredient) => {
        const normalizedItem = normalizeGroceryIngredient({
          ...ingredient,
          quantity: roundTo(ingredient.quantity * meal.servings * householdSize, 2),
        });
        const key = normalizedItem.key;
        const existing = merged.get(key);

        if (existing) {
          existing.quantity = roundTo(existing.quantity + normalizedItem.quantity, 2);
        } else {
          merged.set(key, normalizedItem);
        }
      });
    });
  });

  return Array.from(merged.values()).sort((left, right) =>
    left.category === right.category
      ? left.name.localeCompare(right.name)
      : left.category.localeCompare(right.category),
  );
}

function normalizeList(document: {
  _id: { toString(): string };
  userId: { toString(): string };
  linkedMealPlanId: { toString(): string };
  items: GroceryItem[];
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    _id: document._id.toString(),
    userId: document.userId.toString(),
    linkedMealPlanId: document.linkedMealPlanId.toString(),
    items: document.items.map((item) => ({
      ...item,
      key: getGroceryItemKey(item),
    })),
    createdAt: document.createdAt?.toISOString(),
    updatedAt: document.updatedAt?.toISOString(),
  } satisfies GroceryListPayload;
}

export async function getOrCreateGroceryList(user: AuthUser, plan: MealPlanPayload) {
  await connectToDatabase();
  const query = {
    linkedMealPlanId: new Types.ObjectId(plan._id),
    userId: new Types.ObjectId(user.id),
  };
  const existing = await GroceryListModel.findOne(query).lean();
  const builtItems = await buildItems(plan, user.preferences.householdSize);
  const items = mergeCheckedState(builtItems, existing?.items ?? []);

  const list = await GroceryListModel.findOneAndUpdate(
    query,
    {
      $set: {
        items,
      },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  return normalizeList({
    ...list,
    _id: list._id,
    userId: list.userId,
    linkedMealPlanId: list.linkedMealPlanId,
  });
}

export async function updateGroceryItemChecked(
  userId: string,
  listId: string,
  itemKey: string,
  checked: boolean,
) {
  await connectToDatabase();
  const list = await GroceryListModel.findOne({
    _id: new Types.ObjectId(listId),
    userId: new Types.ObjectId(userId),
  });

  if (!list) {
    throw new Error("Grocery list not found");
  }

  const item = list.items.find(
    (candidate: { toObject?: () => GroceryItem } & GroceryItem) =>
      getGroceryItemKey(candidate.toObject?.() ?? candidate) === itemKey,
  );

  if (!item) {
    throw new Error("Grocery item not found");
  }

  item.key = item.key ?? itemKey;
  item.checked = checked;
  await list.save();

  return normalizeList({
    ...list.toObject(),
    _id: list._id,
    userId: list.userId,
    linkedMealPlanId: list.linkedMealPlanId,
  });
}
