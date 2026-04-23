import crypto from "crypto";

import OpenAI from "openai";
import { z } from "zod";

import { connectToDatabase } from "@/lib/db";
import { env, getAiApiKey } from "@/lib/env";
import { normalizeIngredientNames, roundTo, slugify } from "@/lib/utils";
import { GeneratedMealModel } from "@/server/models/GeneratedMeal";
import { saveRecipe } from "@/server/services/recipe-service";
import type { AuthUser, GeneratedRecipePayload, RecipeIngredient } from "@/types";

const generatedRecipeSchema = z.object({
  name: z.string().min(4).max(120),
  ingredients: z.array(z.string().min(2)).min(3).max(20),
  steps: z.array(z.string().min(8)).min(2).max(8),
  cooking_time: z.number().min(5).max(120),
  calories: z.number().min(100).max(1800),
  protein: z.number().min(0).max(220),
  carbs: z.number().min(0).max(240),
  fats: z.number().min(0).max(140),
});

const ingredientCosts: Record<string, number> = {
  chicken: 2.8,
  salmon: 4.8,
  tuna: 2.1,
  beef: 3.5,
  turkey: 2.9,
  tofu: 1.8,
  lentils: 0.7,
  beans: 0.6,
  rice: 0.4,
  oats: 0.3,
  egg: 0.5,
  eggs: 0.5,
  yogurt: 1,
  milk: 0.7,
  spinach: 0.9,
  broccoli: 1.1,
  "sweet potato": 1.1,
  potato: 0.8,
  avocado: 1.4,
};

function inferCategory(name: string) {
  const value = name.toLowerCase();

  if (/(chicken|salmon|tuna|turkey|beef|egg|tofu|lentil|bean|shrimp)/.test(value)) {
    return "protein";
  }

  if (/(rice|oat|quinoa|bread|wrap|pasta|farro|polenta)/.test(value)) {
    return "grains";
  }

  if (/(milk|yogurt|feta|parmesan|cottage|cheese)/.test(value)) {
    return "dairy";
  }

  if (/(almond|walnut|peanut|seed)/.test(value)) {
    return "nuts";
  }

  if (/(oil|sauce|paste|spice|salt|pepper|garlic powder|vinegar)/.test(value)) {
    return "pantry";
  }

  return "produce";
}

function inferCost(name: string) {
  const lower = name.toLowerCase();

  for (const [key, value] of Object.entries(ingredientCosts)) {
    if (lower.includes(key)) {
      return value;
    }
  }

  return 0.9;
}

function parseIngredientLine(line: string): RecipeIngredient {
  const cleaned = line.replace(/\s+/g, " ").trim();
  const matched =
    cleaned.match(
      /^([\d/.]+)?\s*([a-zA-Z]+)?\s*(.+)$/u,
    ) ?? [];
  const quantity = matched[1] ? Number.parseFloat(matched[1].replace("/", ".")) : 1;
  const unit = matched[2] ?? "item";
  const name = matched[3] ?? cleaned;

  return {
    name,
    quantity: Number.isFinite(quantity) ? quantity : 1,
    unit,
    category: inferCategory(name),
    estimatedCost: inferCost(name),
  };
}

function extractJson(content: string) {
  const fenced = content.match(/```json([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }

  const firstBrace = content.indexOf("{");
  const lastBrace = content.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1);
  }

  return content;
}

function toCleanString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.replace(/[^\d.-]/g, "");
    const parsed = Number.parseFloat(normalized);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return value;
}

function normalizeIngredientValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    const name =
      toCleanString(candidate.name) ||
      toCleanString(candidate.ingredient) ||
      toCleanString(candidate.item) ||
      toCleanString(candidate.title);
    const quantity =
      toCleanString(candidate.quantity) || toCleanString(candidate.amount) || "";
    const unit = toCleanString(candidate.unit);
    const assembled = [quantity, unit, name].filter(Boolean).join(" ").trim();
    return assembled || JSON.stringify(candidate);
  }

  return "";
}

function normalizeStepValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const candidate = value as Record<string, unknown>;
    return (
      toCleanString(candidate.step) ||
      toCleanString(candidate.instruction) ||
      toCleanString(candidate.description) ||
      JSON.stringify(candidate)
    );
  }

  return "";
}

function normalizeGeneratedRecipe(candidate: unknown) {
  if (!candidate || typeof candidate !== "object") {
    return candidate;
  }

  const recipe = candidate as Record<string, unknown>;

  return {
    ...recipe,
    ingredients: Array.isArray(recipe.ingredients)
      ? recipe.ingredients.map(normalizeIngredientValue).filter(Boolean)
      : recipe.ingredients,
    steps: Array.isArray(recipe.steps) ? recipe.steps.map(normalizeStepValue).filter(Boolean) : recipe.steps,
    cooking_time: toNumber(recipe.cooking_time),
    calories: toNumber(recipe.calories),
    protein: toNumber(recipe.protein),
    carbs: toNumber(recipe.carbs),
    fats: toNumber(recipe.fats),
  };
}

function getCacheKey(input: {
  ingredients: string[];
  mealType: string;
  dietaryPreference: string;
  cookingTimeLimit?: number;
  user: AuthUser;
}) {
  return crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        ingredients: normalizeIngredientNames(input.ingredients),
        mealType: input.mealType,
        dietaryPreference: input.dietaryPreference,
        cookingTimeLimit: input.cookingTimeLimit ?? null,
        likedIngredients: input.user.preferences.likedIngredients,
        dislikedIngredients: input.user.preferences.dislikedIngredients,
        allergies: input.user.preferences.allergies,
      }),
    )
    .digest("hex");
}

function buildPrompt(input: {
  ingredients: string[];
  mealType: string;
  dietaryPreference: string;
  cookingTimeLimit?: number;
  user: AuthUser;
}) {
  const preferenceNotes = [
    `diet: ${input.user.preferences.diet}`,
    `goal: ${input.user.preferences.goal}`,
    `daily calorie target: ${input.user.preferences.dailyCalories}`,
    `liked ingredients: ${input.user.preferences.likedIngredients.join(", ") || "none"}`,
    `avoid: ${[
      ...input.user.preferences.dislikedIngredients,
      ...input.user.preferences.allergies,
    ].join(", ") || "none"}`,
  ].join("\n");

  return `Generate a realistic ${input.mealType} recipe using these ingredients: ${input.ingredients.join(", ")}.
Dietary preference: ${input.dietaryPreference}.
${input.cookingTimeLimit ? `Stay within ${input.cookingTimeLimit} minutes.` : "Keep cooking time practical and under 45 minutes."}
User preferences:
${preferenceNotes}

Use mostly the provided ingredients. You may add a few realistic pantry or produce extras only when necessary.
Prevent unrealistic combinations. Keep the nutrition internally consistent.
Return ONLY JSON with:
name, ingredients, steps, cooking_time, calories, protein, carbs, fats.`;
}

async function callOpenAi(prompt: string) {
  const apiKey = getAiApiKey();

  if (!apiKey) {
    throw new Error(
      "Missing required environment variable: OPENAI_API_KEY or GROQ_API_KEY or XAI_API_KEY",
    );
  }

  const client = new OpenAI({
    apiKey,
    baseURL: env.aiBaseUrl || undefined,
  });

  const completion = await client.chat.completions.create({
    model: env.openAiModel,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a culinary nutrition expert. Return valid JSON only, with no markdown or extra text.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  const message = completion.choices[0]?.message?.content;

  if (!message) {
    throw new Error("The AI response was empty");
  }

  return message;
}

export async function generateMealWithAi(input: {
  ingredients: string[];
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  dietaryPreference: AuthUser["preferences"]["diet"];
  cookingTimeLimit?: number;
  saveRecipe?: boolean;
  user: AuthUser;
}) {
  await connectToDatabase();
  const normalizedIngredients = normalizeIngredientNames(input.ingredients);

  if (normalizedIngredients.length < 2) {
    return {
      recipe: null,
      fromCache: false,
      savedRecipe: null,
      suggestions: ["Add a protein and a produce item to generate a stronger recipe."],
    };
  }

  const cacheKey = getCacheKey({
    ...input,
    ingredients: normalizedIngredients,
  });

  const cached = await GeneratedMealModel.findOne({ cacheKey }).lean();

  if (cached) {
    const cachedIngredients = cached.generatedRecipe.ingredients.map(parseIngredientLine);
    const savedRecipe = input.saveRecipe
      ? await saveRecipe(
          {
            name: cached.generatedRecipe.name,
            mealType: input.mealType,
            dietaryTags: [input.dietaryPreference],
            ingredients: cachedIngredients,
            steps: cached.generatedRecipe.steps,
            cookingTime: cached.generatedRecipe.cooking_time,
            nutrition: {
              calories: cached.generatedRecipe.calories,
              protein: cached.generatedRecipe.protein,
              carbs: cached.generatedRecipe.carbs,
              fats: cached.generatedRecipe.fats,
            },
            estimatedCost: roundTo(
              cachedIngredients.reduce(
                (sum: number, ingredient: RecipeIngredient) => sum + ingredient.estimatedCost,
                0,
              ),
              2,
            ),
          },
          input.user.id,
          cacheKey,
        )
      : null;

    return {
      recipe: cached.generatedRecipe as GeneratedRecipePayload,
      fromCache: true,
      savedRecipe,
      suggestions: [],
    };
  }

  const prompt = buildPrompt({
    ...input,
    ingredients: normalizedIngredients,
  });

  let parsedRecipe: GeneratedRecipePayload | null = null;
  let lastError = "Unable to generate recipe";

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const responseText = await callOpenAi(prompt);
      const candidate = JSON.parse(extractJson(responseText));
      parsedRecipe = generatedRecipeSchema.parse(normalizeGeneratedRecipe(candidate));
      break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : "Unable to generate recipe";
    }
  }

  if (!parsedRecipe) {
    throw new Error(lastError);
  }

  await GeneratedMealModel.create({
    cacheKey,
    inputIngredients: normalizedIngredients,
    mealType: input.mealType,
    dietaryPreference: input.dietaryPreference,
    cookingTimeLimit: input.cookingTimeLimit ?? null,
    generatedRecipe: parsedRecipe,
  });

  const structuredIngredients = parsedRecipe.ingredients.map(parseIngredientLine);
  const estimatedCost = roundTo(
    structuredIngredients.reduce((sum, ingredient) => sum + ingredient.estimatedCost, 0),
    2,
  );

  const savedRecipe = input.saveRecipe
    ? await saveRecipe(
        {
          name: parsedRecipe.name,
          mealType: input.mealType,
          dietaryTags: [input.dietaryPreference],
          ingredients: structuredIngredients,
          steps: parsedRecipe.steps,
          cookingTime: parsedRecipe.cooking_time,
          nutrition: {
            calories: parsedRecipe.calories,
            protein: parsedRecipe.protein,
            carbs: parsedRecipe.carbs,
            fats: parsedRecipe.fats,
          },
          estimatedCost,
          notes: `AI generated from ${normalizedIngredients.join(", ")}.`,
        },
        input.user.id,
        cacheKey,
      )
    : null;

  const suggestions =
    structuredIngredients.filter((ingredient) => ingredient.category === "protein").length === 0
      ? ["Add a protein source next time for a more balanced recipe."]
      : [];

  return {
    recipe: parsedRecipe,
    fromCache: false,
    savedRecipe,
    suggestions,
    cacheKey,
    slug: slugify(parsedRecipe.name),
  };
}
