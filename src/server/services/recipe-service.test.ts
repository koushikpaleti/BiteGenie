import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  connectToDatabase: vi.fn(),
  findOne: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  connectToDatabase: mocks.connectToDatabase,
}));

vi.mock("@/server/models/Recipe", () => ({
  RecipeModel: {
    findOne: mocks.findOne,
    create: mocks.create,
  },
}));

import { saveRecipe } from "@/server/services/recipe-service";

const userId = "507f1f77bcf86cd799439011";

const recipeInput = {
  name: "AI Paneer Bowl",
  mealType: "dinner" as const,
  dietaryTags: ["vegetarian", "high-protein"] as const,
  ingredients: [
    {
      name: "Paneer",
      quantity: 200,
      unit: "g",
      category: "protein",
      estimatedCost: 2.4,
    },
  ],
  steps: ["Cook paneer well and serve hot."],
  cookingTime: 20,
  nutrition: {
    calories: 480,
    protein: 24,
    carbs: 18,
    fats: 28,
  },
  estimatedCost: 4.8,
  notes: "Cached AI recipe.",
};

describe("saveRecipe", () => {
  beforeEach(() => {
    mocks.connectToDatabase.mockReset();
    mocks.findOne.mockReset();
    mocks.create.mockReset();
  });

  it("reuses an existing saved AI recipe for the same user and cache key", async () => {
    mocks.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        _id: { toString: () => "recipe-1" },
        name: recipeInput.name,
        slug: "ai-paneer-bowl",
        mealType: recipeInput.mealType,
        dietaryTags: [...recipeInput.dietaryTags],
        ingredients: recipeInput.ingredients,
        steps: recipeInput.steps,
        cookingTime: recipeInput.cookingTime,
        nutrition: recipeInput.nutrition,
        estimatedCost: recipeInput.estimatedCost,
        source: "ai",
        notes: recipeInput.notes,
        cachedKey: "cache-1",
        createdBy: { toString: () => userId },
        likedBy: [],
      }),
    });

    const saved = await saveRecipe(recipeInput, userId, "cache-1");

    expect(saved._id).toBe("recipe-1");
    expect(saved.slug).toBe("ai-paneer-bowl");
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("creates a new recipe when no reusable AI recipe exists", async () => {
    mocks.findOne.mockReturnValue({
      lean: vi.fn().mockResolvedValue(null),
    });
    mocks.create.mockResolvedValue({
      _id: { toString: () => "recipe-2" },
      createdBy: { toString: () => userId },
      likedBy: [],
      toObject() {
        return {
          ...recipeInput,
          _id: this._id,
          slug: "ai-paneer-bowl-new",
          source: "ai",
          createdBy: this.createdBy,
          likedBy: this.likedBy,
          cachedKey: "cache-2",
        };
      },
    });

    const saved = await saveRecipe(recipeInput, userId, "cache-2");

    expect(saved._id).toBe("recipe-2");
    expect(saved.source).toBe("ai");
    expect(mocks.create).toHaveBeenCalledTimes(1);
  });
});
