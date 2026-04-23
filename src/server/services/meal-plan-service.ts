import { addDays, format, parseISO } from "date-fns";
import { Types } from "mongoose";

import { connectToDatabase } from "@/lib/db";
import { multiplyNutrition, sumNutrition } from "@/lib/nutrition";
import { formatIsoDate, roundTo } from "@/lib/utils";
import { MealPlanModel } from "@/server/models/MealPlan";
import { RecipeModel } from "@/server/models/Recipe";
import { generateMealWithAi } from "@/server/services/ai-meal-service";
import {
  ensureSeedRecipes,
  getRecipeById,
  recipeMatchesDiet,
} from "@/server/services/recipe-service";
import type {
  AuthUser,
  MealPlanPayload,
  PlannedDay,
  PlannedMeal,
  RecipeDocumentShape,
} from "@/types";

const calorieDistribution: Record<PlannedMeal["mealType"], number> = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.35,
  snack: 0.1,
};

type MutableMealEntry = {
  _id?: Types.ObjectId;
  mealType: PlannedMeal["mealType"];
  recipeId: Types.ObjectId;
  servings: number;
  nutrition: PlannedMeal["nutrition"];
  estimatedCost: number;
};

type MutableMealArray = MutableMealEntry[] & {
  id(id: string): MutableMealEntry | null;
};

type MutableDayEntry = {
  _id?: Types.ObjectId;
  date: string;
  meals: MutableMealArray;
  totalNutrition: PlannedDay["totalNutrition"];
  estimatedCost: number;
};

type MutableDayArray = MutableDayEntry[] & {
  id(id: string): MutableDayEntry | null;
};

type MutablePlanObject = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  startDate: string;
  endDate: string;
  days: Array<{
    _id: Types.ObjectId;
    date: string;
    meals: Array<{
      _id: Types.ObjectId;
      mealType: PlannedMeal["mealType"];
      recipeId: Types.ObjectId;
      servings: number;
      nutrition: PlannedMeal["nutrition"];
      estimatedCost: number;
    }>;
    totalNutrition: PlannedDay["totalNutrition"];
    estimatedCost: number;
  }>;
  totalNutrition: MealPlanPayload["totalNutrition"];
  estimatedCost: number;
  reuseSuggestions: string[];
  insights: string[];
  createdAt?: Date;
  updatedAt?: Date;
};

type MutablePlanDocument = {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  days: MutableDayArray;
  totalNutrition: MealPlanPayload["totalNutrition"];
  estimatedCost: number;
  save(): Promise<unknown>;
  toObject(): MutablePlanObject;
};

function normalizeRecipe(document: {
  _id: { toString(): string };
  name: string;
  slug: string;
  mealType: RecipeDocumentShape["mealType"];
  dietaryTags: RecipeDocumentShape["dietaryTags"];
  ingredients: RecipeDocumentShape["ingredients"];
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

function servingStep(value: number) {
  return Math.min(2, Math.max(0.5, Math.round(value * 2) / 2));
}

function scoreRecipe(params: {
  recipe: RecipeDocumentShape;
  user: AuthUser;
  usedRecipeIds: string[];
  currentIngredients: string[];
  averageMealBudget: number;
}) {
  const recipeIngredients = params.recipe.ingredients.map((ingredient) =>
    ingredient.name.toLowerCase(),
  );
  const likedHits = recipeIngredients.filter((ingredient) =>
    params.user.preferences.likedIngredients.some((liked) =>
      ingredient.includes(liked.toLowerCase()),
    ),
  ).length;
  const overlap = recipeIngredients.filter((ingredient) =>
    params.currentIngredients.some((current) => ingredient.includes(current)),
  ).length;
  const favoriteBoost = params.recipe.likedBy?.includes(params.user.id) ? 5 : 0;
  const repeatPenalty = params.usedRecipeIds.includes(params.recipe._id ?? "") ? 7 : 0;
  const dislikePenalty = recipeIngredients.some((ingredient) =>
    [...params.user.preferences.dislikedIngredients, ...params.user.preferences.allergies].some(
      (blocked) => ingredient.includes(blocked.toLowerCase()),
    ),
  )
    ? 100
    : 0;
  const budgetPenalty =
    params.recipe.estimatedCost > params.averageMealBudget
      ? params.recipe.estimatedCost - params.averageMealBudget
      : 0;

  return likedHits * 3 + overlap * 1.5 + favoriteBoost - repeatPenalty - budgetPenalty - dislikePenalty;
}

function buildMeal(recipe: RecipeDocumentShape, targetCalories: number): PlannedMeal {
  const servings = servingStep(targetCalories / recipe.nutrition.calories);

  return {
    mealType: recipe.mealType,
    recipeId: recipe._id ?? "",
    servings,
    nutrition: multiplyNutrition(recipe.nutrition, servings),
    estimatedCost: roundTo(recipe.estimatedCost * servings, 2),
    recipe,
  };
}

function recalculateDay(day: PlannedDay) {
  day.totalNutrition = sumNutrition(day.meals.map((meal) => meal.nutrition));
  day.estimatedCost = roundTo(
    day.meals.reduce((sum, meal) => sum + meal.estimatedCost, 0),
    2,
  );
  return day;
}

function summarizeInsights(days: PlannedDay[], user: AuthUser) {
  const averageCalories =
    days.reduce((sum, day) => sum + day.totalNutrition.calories, 0) / days.length;
  const averageProtein =
    days.reduce((sum, day) => sum + day.totalNutrition.protein, 0) / days.length;
  const averageCost = days.reduce((sum, day) => sum + day.estimatedCost, 0) / days.length;

  return [
    averageCalories < user.preferences.dailyCalories * 0.92
      ? "Calories are slightly under target, which fits a lighter week."
      : "Calories are landing close to target for steady adherence.",
    averageProtein >= user.preferences.proteinTarget * 0.9
      ? "Protein coverage is strong across the week."
      : "Protein runs a little low, so prioritize a higher-protein lunch swap.",
    averageCost * days.length <= user.preferences.weeklyBudget
      ? "The plan stays within your stated weekly budget."
      : "This plan runs above budget, so the next swap should lean on lower-cost dinners.",
  ];
}

function buildReuseSuggestions(days: PlannedDay[]) {
  const suggestions: string[] = [];

  days.forEach((day, index) => {
    const dinner = day.meals.find((meal) => meal.mealType === "dinner");
    const nextLunch = days[index + 1]?.meals.find((meal) => meal.mealType === "lunch");

    if (!dinner?.recipe || !nextLunch?.recipe) {
      return;
    }

    const overlap = dinner.recipe.ingredients.filter((ingredient) =>
      nextLunch.recipe?.ingredients.some((candidate) => candidate.name === ingredient.name),
    );

    if (overlap.length >= 2) {
      suggestions.push(
        `${dinner.recipe.name} and ${nextLunch.recipe.name} share ${overlap
          .slice(0, 2)
          .map((ingredient) => ingredient.name)
          .join(", ")} for easier prep.`,
      );
    }
  });

  return suggestions;
}

async function loadCandidateRecipes(userId: string, user: AuthUser) {
  await ensureSeedRecipes();

  const recipes = await RecipeModel.find({
    $or: [{ source: "seed" }, { createdBy: new Types.ObjectId(userId) }],
  }).lean();

  return recipes
    .map((recipe) =>
      normalizeRecipe({
        ...recipe,
        _id: recipe._id,
        createdBy: recipe.createdBy,
        likedBy: recipe.likedBy,
      }),
    )
    .filter((recipe) => recipeMatchesDiet(recipe, user.preferences.diet))
    .filter((recipe) =>
      recipe.ingredients.every(
        (ingredient) =>
          ![...user.preferences.dislikedIngredients, ...user.preferences.allergies].some(
            (blocked) => ingredient.name.toLowerCase().includes(blocked.toLowerCase()),
          ),
      ),
    );
}

async function enrichMealPlan(document: {
  _id: { toString(): string };
  userId: { toString(): string };
  startDate: string;
  endDate: string;
  days: Array<{
    _id: { toString(): string };
    date: string;
    meals: Array<{
      _id: { toString(): string };
      mealType: PlannedMeal["mealType"];
      recipeId: { toString(): string };
      servings: number;
      nutrition: PlannedMeal["nutrition"];
      estimatedCost: number;
    }>;
    totalNutrition: PlannedDay["totalNutrition"];
    estimatedCost: number;
  }>;
  totalNutrition: MealPlanPayload["totalNutrition"];
  estimatedCost: number;
  reuseSuggestions: string[];
  insights: string[];
  createdAt?: Date;
  updatedAt?: Date;
}) {
  const recipeIds = document.days.flatMap((day) => day.meals.map((meal) => meal.recipeId.toString()));
  const recipes = await RecipeModel.find({
    _id: { $in: recipeIds.map((value) => new Types.ObjectId(value)) },
  }).lean();

  const recipeMap = new Map(
    recipes.map((recipe) => [
      recipe._id.toString(),
      normalizeRecipe({
        ...recipe,
        _id: recipe._id,
        createdBy: recipe.createdBy,
        likedBy: recipe.likedBy,
      }),
    ]),
  );

  return {
    _id: document._id.toString(),
    userId: document.userId.toString(),
    startDate: document.startDate,
    endDate: document.endDate,
    days: document.days.map((day) => ({
      _id: day._id.toString(),
      date: day.date,
      meals: day.meals.map((meal) => ({
        _id: meal._id.toString(),
        mealType: meal.mealType,
        recipeId: meal.recipeId.toString(),
        servings: meal.servings,
        nutrition: meal.nutrition,
        estimatedCost: meal.estimatedCost,
        recipe: recipeMap.get(meal.recipeId.toString()),
      })),
      totalNutrition: day.totalNutrition,
      estimatedCost: day.estimatedCost,
    })),
    totalNutrition: document.totalNutrition,
    estimatedCost: document.estimatedCost,
    reuseSuggestions: document.reuseSuggestions,
    insights: document.insights,
    createdAt: document.createdAt?.toISOString(),
    updatedAt: document.updatedAt?.toISOString(),
  } satisfies MealPlanPayload;
}

export async function getLatestMealPlan(userId: string) {
  await connectToDatabase();
  const today = format(new Date(), "yyyy-MM-dd");
  const currentPlan = await MealPlanModel.findOne({
    userId,
    startDate: { $lte: today },
    endDate: { $gte: today },
  })
    .sort({ updatedAt: -1, startDate: -1 })
    .lean();

  const plan =
    currentPlan ??
    (await MealPlanModel.findOne({ userId }).sort({ updatedAt: -1, startDate: -1 }).lean());

  if (!plan) {
    return null;
  }

  return enrichMealPlan({
    ...plan,
    _id: plan._id,
    userId: plan.userId,
  });
}

export async function createMealPlan(
  user: AuthUser,
  input: { startDate: string; days: number; strategy?: "smart" | "empty" },
) {
  await connectToDatabase();
  const startDate = parseISO(input.startDate);

  if (input.strategy === "empty") {
    const emptyDays = Array.from({ length: input.days }, (_, index) => ({
      date: formatIsoDate(addDays(startDate, index)),
      meals: [],
      totalNutrition: sumNutrition([]),
      estimatedCost: 0,
    })) satisfies PlannedDay[];

    const created = await MealPlanModel.findOneAndUpdate(
      {
        userId: new Types.ObjectId(user.id),
        startDate: input.startDate,
      },
      {
        userId: new Types.ObjectId(user.id),
        startDate: input.startDate,
        endDate: formatIsoDate(addDays(startDate, input.days - 1)),
        days: emptyDays,
        totalNutrition: sumNutrition([]),
        estimatedCost: 0,
        reuseSuggestions: [],
        insights: ["Build your week meal by meal to generate nutrition and grocery insights."],
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    return enrichMealPlan({
      ...created.toObject(),
      _id: created._id,
      userId: created.userId,
    });
  }

  const candidates = await loadCandidateRecipes(user.id, user);
  const averageMealBudget =
    user.preferences.weeklyBudget /
    Math.max(1, input.days * user.preferences.preferredMealTypes.length);
  const days: PlannedDay[] = [];
  const usedRecipeIds: string[] = [];

  for (let index = 0; index < input.days; index += 1) {
    const date = formatIsoDate(addDays(startDate, index));
    const selectedIngredients: string[] = [];
    const meals: PlannedMeal[] = [];

    for (const mealType of user.preferences.preferredMealTypes) {
      const pool = candidates.filter((recipe) => recipe.mealType === mealType);

      if (!pool.length) {
        continue;
      }

      const recipe = pool
        .map((candidate) => ({
          candidate,
          score: scoreRecipe({
            recipe: candidate,
            user,
            usedRecipeIds,
            currentIngredients: selectedIngredients,
            averageMealBudget,
          }),
        }))
        .sort((left, right) => right.score - left.score)[0]?.candidate;

      if (!recipe) {
        continue;
      }

      const targetCalories = user.preferences.dailyCalories * calorieDistribution[mealType];
      const meal = buildMeal(recipe, targetCalories);
      meals.push(meal);
      usedRecipeIds.push(recipe._id ?? "");
      selectedIngredients.push(
        ...recipe.ingredients.map((ingredient) => ingredient.name.toLowerCase()),
      );
    }

    const day = recalculateDay({
      date,
      meals,
      totalNutrition: sumNutrition(meals.map((meal) => meal.nutrition)),
      estimatedCost: roundTo(meals.reduce((sum, meal) => sum + meal.estimatedCost, 0), 2),
    });

    days.push(day);
  }

  const totalNutrition = sumNutrition(days.map((day) => day.totalNutrition));
  const estimatedCost = roundTo(days.reduce((sum, day) => sum + day.estimatedCost, 0), 2);
  const reuseSuggestions = buildReuseSuggestions(days);
  const insights = summarizeInsights(days, user);

  const payload = {
    userId: new Types.ObjectId(user.id),
    startDate: input.startDate,
    endDate: formatIsoDate(addDays(startDate, input.days - 1)),
    days: days.map((day) => ({
      date: day.date,
      meals: day.meals.map((meal) => ({
        mealType: meal.mealType,
        recipeId: new Types.ObjectId(meal.recipeId),
        servings: meal.servings,
        nutrition: meal.nutrition,
        estimatedCost: meal.estimatedCost,
      })),
      totalNutrition: day.totalNutrition,
      estimatedCost: day.estimatedCost,
    })),
    totalNutrition,
    estimatedCost,
    reuseSuggestions,
    insights,
  };

  const created = await MealPlanModel.findOneAndUpdate(
    {
      userId: new Types.ObjectId(user.id),
      startDate: input.startDate,
    },
    payload,
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return enrichMealPlan({
    ...created.toObject(),
    _id: created._id,
    userId: created.userId,
  });
}

async function saveMutatedPlan(plan: MutablePlanDocument) {
  plan.days.forEach((day) => {
    day.totalNutrition = sumNutrition(day.meals.map((meal) => meal.nutrition));
    day.estimatedCost = roundTo(
      day.meals.reduce((sum, meal) => sum + meal.estimatedCost, 0),
      2,
    );
  });

  plan.totalNutrition = sumNutrition(plan.days.map((day) => day.totalNutrition));
  plan.estimatedCost = roundTo(plan.days.reduce((sum, day) => sum + day.estimatedCost, 0), 2);
  await plan.save();

  return enrichMealPlan({
    ...plan.toObject(),
    _id: plan._id,
    userId: plan.userId,
  });
}

export async function mutateMealPlan(
  user: AuthUser,
  planId: string,
  action:
    | { action: "update_servings"; dayId: string; mealId: string; servings: number }
    | { action: "swap_recipe"; dayId: string; mealId: string }
    | { action: "regenerate_meal"; dayId: string; mealId: string }
    | { action: "add_recipe_to_day"; dayId: string; mealType: PlannedMeal["mealType"]; recipeId: string }
    | { action: "remove_meal"; dayId: string; mealId: string },
) {
  await connectToDatabase();
  const plan = (await MealPlanModel.findOne({
    _id: new Types.ObjectId(planId),
    userId: new Types.ObjectId(user.id),
  })) as MutablePlanDocument | null;

  if (!plan) {
    throw new Error("Meal plan not found");
  }

  const day = plan.days.id(action.dayId);

  if (!day) {
    throw new Error("Meal day not found");
  }

  if (action.action === "update_servings") {
    const meal = day.meals.id(action.mealId);
    if (!meal) {
      throw new Error("Meal not found");
    }

    const recipe = await getRecipeById(meal.recipeId.toString());
    if (!recipe) {
      throw new Error("Recipe not found");
    }

    meal.servings = action.servings;
    meal.nutrition = multiplyNutrition(recipe.nutrition, action.servings);
    meal.estimatedCost = roundTo(recipe.estimatedCost * action.servings, 2);

    return saveMutatedPlan(plan);
  }

  if (action.action === "add_recipe_to_day") {
    const recipe = await getRecipeById(action.recipeId);

    if (!recipe) {
      throw new Error("Recipe not found");
    }

    const existing = day.meals.find((meal) => meal.mealType === action.mealType);
    const nextMeal = buildMeal(recipe, user.preferences.dailyCalories * calorieDistribution[action.mealType]);

    if (existing) {
      existing.recipeId = new Types.ObjectId(nextMeal.recipeId);
      existing.servings = nextMeal.servings;
      existing.nutrition = nextMeal.nutrition;
      existing.estimatedCost = nextMeal.estimatedCost;
    } else {
      day.meals.push({
        mealType: action.mealType,
        recipeId: new Types.ObjectId(nextMeal.recipeId),
        servings: nextMeal.servings,
        nutrition: nextMeal.nutrition,
        estimatedCost: nextMeal.estimatedCost,
      });
    }

    return saveMutatedPlan(plan);
  }

  if (action.action === "remove_meal") {
    day.meals = day.meals.filter(
      (entry) => entry._id?.toString() !== action.mealId,
    ) as MutableMealArray;
    return saveMutatedPlan(plan);
  }

  const meal = day.meals.id(action.mealId);
  if (!meal) {
    throw new Error("Meal not found");
  }

  if (action.action === "swap_recipe") {
    const mealType = meal.mealType as PlannedMeal["mealType"];
    const current = await getRecipeById(meal.recipeId.toString());
    const candidates = await loadCandidateRecipes(user.id, user);
    const replacement = candidates
      .filter((recipe) => recipe.mealType === mealType)
      .filter((recipe) => recipe._id !== current?._id)
      .sort(
        (left, right) =>
          scoreRecipe({
            recipe: right,
            user,
            usedRecipeIds: plan.days.flatMap((entry) =>
              entry.meals.map((candidateMeal) => candidateMeal.recipeId.toString()),
            ),
            currentIngredients: current?.ingredients.map((ingredient) => ingredient.name.toLowerCase()) ?? [],
            averageMealBudget:
              user.preferences.weeklyBudget /
              Math.max(1, plan.days.length * user.preferences.preferredMealTypes.length),
          }) -
          scoreRecipe({
            recipe: left,
            user,
            usedRecipeIds: plan.days.flatMap((entry) =>
              entry.meals.map((candidateMeal) => candidateMeal.recipeId.toString()),
            ),
            currentIngredients: current?.ingredients.map((ingredient) => ingredient.name.toLowerCase()) ?? [],
            averageMealBudget:
              user.preferences.weeklyBudget /
              Math.max(1, plan.days.length * user.preferences.preferredMealTypes.length),
          }),
      )[0];

    if (!replacement) {
      throw new Error("No swap candidates available");
    }

    const replacementMeal = buildMeal(
      replacement,
      user.preferences.dailyCalories * calorieDistribution[mealType],
    );

    meal.recipeId = new Types.ObjectId(replacementMeal.recipeId);
    meal.servings = replacementMeal.servings;
    meal.nutrition = replacementMeal.nutrition;
    meal.estimatedCost = replacementMeal.estimatedCost;

    return saveMutatedPlan(plan);
  }

  const current = await getRecipeById(meal.recipeId.toString());

  if (!current) {
    throw new Error("Current recipe not found");
  }

  try {
    const mealType = meal.mealType as PlannedMeal["mealType"];
    const aiResult = await generateMealWithAi({
      ingredients: current.ingredients.slice(0, 5).map((ingredient) => ingredient.name),
      mealType,
      dietaryPreference: user.preferences.diet,
      cookingTimeLimit: current.cookingTime,
      saveRecipe: true,
      user,
    });

    if (aiResult.savedRecipe) {
      const replacementMeal = buildMeal(
        aiResult.savedRecipe,
        user.preferences.dailyCalories * calorieDistribution[mealType],
      );

      meal.recipeId = new Types.ObjectId(replacementMeal.recipeId);
      meal.servings = replacementMeal.servings;
      meal.nutrition = replacementMeal.nutrition;
      meal.estimatedCost = replacementMeal.estimatedCost;
    }
  } catch {
    return mutateMealPlan(user, planId, {
      action: "swap_recipe",
      dayId: action.dayId,
      mealId: action.mealId,
    });
  }

  return saveMutatedPlan(plan);
}
