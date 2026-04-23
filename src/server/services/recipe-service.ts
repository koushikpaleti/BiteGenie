import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { seedRecipes } from "@/server/data/seed-recipes";
import { RecipeModel } from "@/server/models/Recipe";
import type {
  DietaryPreference,
  RecipeDocumentShape,
  RecipeIngredient,
} from "@/types";

function normalizeRecipe(document: {
  _id: { toString(): string };
  name: string;
  slug: string;
  mealType: RecipeDocumentShape["mealType"];
  dietaryTags: DietaryPreference[];
  ingredients: RecipeIngredient[];
  steps: string[];
  cookingTime: number;
  nutrition: RecipeDocumentShape["nutrition"];
  estimatedCost: number;
  source: RecipeDocumentShape["source"];
  notes?: string;
  likedBy?: Array<{ toString(): string }>;
  createdBy?: { toString(): string } | null;
}) {
  return {
    _id: document._id.toString(),
    name: document.name,
    slug: document.slug,
    mealType: document.mealType,
    dietaryTags: document.dietaryTags,
    ingredients: document.ingredients,
    steps: document.steps,
    cookingTime: document.cookingTime,
    nutrition: document.nutrition,
    estimatedCost: document.estimatedCost,
    source: document.source,
    notes: document.notes,
    likedBy: document.likedBy?.map((value) => value.toString()) ?? [],
    createdBy: document.createdBy?.toString() ?? null,
  } satisfies RecipeDocumentShape;
}

export function recipeMatchesDiet(
  recipe: { dietaryTags: DietaryPreference[] },
  diet: DietaryPreference,
) {
  if (diet === "balanced") {
    return true;
  }

  return recipe.dietaryTags.includes(diet);
}

export async function ensureSeedRecipes() {
  await connectToDatabase();

  const existingCount = await RecipeModel.countDocuments({
    source: "seed",
  });

  if (existingCount >= seedRecipes.length) {
    return;
  }

  await Promise.all(
    seedRecipes.map((recipe) =>
      RecipeModel.updateOne(
        { slug: recipe.slug },
        { $setOnInsert: recipe },
        { upsert: true },
      ),
    ),
  );
}

export async function listRecipesForUser(userId: string) {
  await ensureSeedRecipes();

  const recipes = await RecipeModel.find({
    $or: [{ source: "seed" }, { createdBy: new Types.ObjectId(userId) }],
  })
    .sort({ createdAt: -1, name: 1 })
    .lean();

  return recipes.map((recipe) =>
    normalizeRecipe({
      ...recipe,
      _id: recipe._id,
      createdBy: recipe.createdBy,
      likedBy: recipe.likedBy,
    }),
  );
}

export async function getRecipeById(recipeId: string) {
  await connectToDatabase();
  const recipe = await RecipeModel.findById(recipeId).lean();

  if (!recipe) {
    return null;
  }

  return normalizeRecipe({
    ...recipe,
    _id: recipe._id,
    createdBy: recipe.createdBy,
    likedBy: recipe.likedBy,
  });
}

export async function saveRecipe(
  recipe: Omit<RecipeDocumentShape, "_id" | "slug" | "source" | "likedBy">,
  userId: string,
  cachedKey?: string,
) {
  await connectToDatabase();
  const createdBy = new Types.ObjectId(userId);

  if (cachedKey) {
    const existing = await RecipeModel.findOne({
      createdBy,
      cachedKey,
    }).lean();

    if (existing) {
      return normalizeRecipe({
        ...existing,
        _id: existing._id,
        createdBy: existing.createdBy,
        likedBy: existing.likedBy,
      });
    }
  }

  const created = await RecipeModel.create({
    ...recipe,
    slug: `${slugify(recipe.name)}-${Date.now().toString(36)}`,
    source: cachedKey ? "ai" : "user",
    createdBy,
    likedBy: [],
    cachedKey: cachedKey ?? null,
  });

  return normalizeRecipe({
    ...created.toObject(),
    _id: created._id,
    createdBy: created.createdBy,
    likedBy: created.likedBy,
  });
}

export async function toggleFavoriteRecipe(recipeId: string, userId: string) {
  await connectToDatabase();
  const objectUserId = new Types.ObjectId(userId);
  const recipe = await RecipeModel.findById(recipeId);

  if (!recipe) {
    throw new Error("Recipe not found");
  }

  const isFavorite = (recipe.likedBy as Types.ObjectId[]).some((entry) =>
    entry.equals(objectUserId),
  );

  recipe.likedBy = isFavorite
    ? (recipe.likedBy as Types.ObjectId[]).filter((entry) => !entry.equals(objectUserId))
    : [...recipe.likedBy, objectUserId];

  await recipe.save();

  return {
    recipe: normalizeRecipe({
      ...recipe.toObject(),
      _id: recipe._id,
      createdBy: recipe.createdBy,
      likedBy: recipe.likedBy,
    }),
    isFavorite: !isFavorite,
  };
}
