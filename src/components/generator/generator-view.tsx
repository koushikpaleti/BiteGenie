"use client";

import { useDeferredValue, useMemo, useState, useTransition } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, swrFetcher } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type {
  AuthUser,
  GeneratedRecipePayload,
  MealPlanPayload,
  RecipeDocumentShape,
} from "@/types";

interface GenerateResponse {
  recipe: GeneratedRecipePayload | null;
  fromCache: boolean;
  savedRecipe: RecipeDocumentShape | null;
  suggestions: string[];
}

export function GeneratorView() {
  const { data: profile } = useSWR<AuthUser>("/api/profile", swrFetcher);
  const { data: mealPlan, mutate: mutateMealPlan } = useSWR<MealPlanPayload | null>(
    "/api/meal-plan",
    swrFetcher,
  );
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    ingredients: "chicken, rice, spinach",
    mealType: "dinner",
    dietaryPreference: "balanced",
    cookingTimeLimit: 25,
  });
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const deferredIngredients = useDeferredValue(form.ingredients);

  const ingredientsPreview = useMemo(
    () =>
      deferredIngredients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .slice(0, 8),
    [deferredIngredients],
  );

  async function runGeneration(saveRecipe = false) {
    startTransition(async () => {
      try {
        const generated = await apiFetch<GenerateResponse>("/api/generate-meal", {
          method: "POST",
          body: JSON.stringify({
            ingredients: form.ingredients
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),
            mealType: form.mealType,
            dietaryPreference: form.dietaryPreference,
            cookingTimeLimit: Number(form.cookingTimeLimit),
            saveRecipe,
          }),
        });

        setResult(generated);
        if (saveRecipe && generated.savedRecipe) {
          toast.success("Recipe saved to your library");
        } else {
          toast.success(generated.fromCache ? "Loaded cached recipe" : "New recipe generated");
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to generate recipe");
      }
    });
  }

  async function addToMealPlan() {
    if (!mealPlan || !selectedDayId) {
      toast.error("Generate a meal plan first and choose a day");
      return;
    }

    let savedRecipe = result?.savedRecipe ?? null;

    if (!savedRecipe) {
      const generated = await apiFetch<GenerateResponse>("/api/generate-meal", {
        method: "POST",
        body: JSON.stringify({
          ingredients: form.ingredients
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          mealType: form.mealType,
          dietaryPreference: form.dietaryPreference,
          cookingTimeLimit: Number(form.cookingTimeLimit),
          saveRecipe: true,
        }),
      });
      setResult(generated);
      savedRecipe = generated.savedRecipe;
    }

    if (!savedRecipe) {
      toast.error("Save the recipe before adding it to a plan");
      return;
    }

    try {
      await apiFetch(`/api/meal-plan/${mealPlan._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "add_recipe_to_day",
          dayId: selectedDayId,
          mealType: form.mealType,
          recipeId: savedRecipe._id,
        }),
      });
      await mutateMealPlan();
      toast.success("Recipe added to your meal plan");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add recipe");
    }
  }

  async function toggleFavorite() {
    if (!result?.savedRecipe?._id) {
      toast.error("Save the recipe first");
      return;
    }

    try {
      const favoriteResult = await apiFetch<{
        recipe: RecipeDocumentShape;
        isFavorite: boolean;
      }>(`/api/recipes/${result.savedRecipe._id}/favorite`, {
        method: "POST",
      });

      setResult((current) =>
        current
          ? {
              ...current,
              savedRecipe: favoriteResult.recipe,
            }
          : current,
      );

      toast.success(
        favoriteResult.isFavorite ? "Added to favorites" : "Removed from favorites",
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update favorite");
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="AI Generator"
        title="Create meals from ingredients you already have"
        description="Use real LLM generation with structured validation, recipe caching, save flows, and direct meal-plan insertion when a recipe earns a spot in your week."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel className="space-y-5">
          <div>
            <p className="text-sm text-slate-500">Recipe input</p>
            <h2 className="mt-2 font-serif text-3xl text-slate-950">Build from ingredients</h2>
          </div>
          <div className="space-y-4">
            <Input
              value={form.ingredients}
              onChange={(event) => setForm((current) => ({ ...current, ingredients: event.target.value }))}
              placeholder="chicken, rice, egg"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                value={form.mealType}
                onChange={(event) => setForm((current) => ({ ...current, mealType: event.target.value }))}
              >
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </Select>
              <Select
                value={form.dietaryPreference}
                onChange={(event) =>
                  setForm((current) => ({ ...current, dietaryPreference: event.target.value }))
                }
              >
                <option value="balanced">Balanced</option>
                <option value="high-protein">High Protein</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="keto">Keto</option>
              </Select>
            </div>
            <Input
              type="number"
              min={5}
              max={120}
              value={form.cookingTimeLimit}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  cookingTimeLimit: Number(event.target.value),
                }))
              }
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {ingredientsPreview.map((ingredient) => (
              <span
                key={ingredient}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
              >
                {ingredient}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Button type="button" onClick={() => runGeneration(false)} disabled={isPending}>
              {isPending ? "Generating..." : "Generate recipe"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => runGeneration(true)}
              disabled={isPending}
            >
              Save recipe
            </Button>
          </div>

          {mealPlan && (
            <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4">
              <p className="text-sm font-medium text-slate-700">Add to current plan</p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <Select
                  value={selectedDayId}
                  onChange={(event) => setSelectedDayId(event.target.value)}
                >
                  <option value="">Choose a day</option>
                  {mealPlan.days.map((day) => (
                    <option key={day._id} value={day._id}>
                      {day.date}
                    </option>
                  ))}
                </Select>
                <Button type="button" variant="secondary" onClick={addToMealPlan}>
                  Add to planner
                </Button>
              </div>
            </div>
          )}

          {profile && (
            <div className="rounded-[24px] bg-slate-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-white/55">Preference memory</p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                This generator uses your saved diet, goal, likes, dislikes, and allergy
                settings to steer outputs toward realistic matches.
              </p>
            </div>
          )}
        </Panel>

        <Panel>
          {!result && !isPending ? (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <h2 className="font-serif text-4xl text-slate-950">Ready for a smarter recipe?</h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                Generate a realistic dish using the ingredients you already have. You can
                save the output, reuse the cache, and send it straight into your meal plan.
              </p>
            </div>
          ) : isPending && !result ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-52 w-full" />
            </div>
          ) : result?.recipe ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {result.fromCache ? "Cached result" : "Freshly generated"}
                  </p>
                  <h2 className="mt-2 font-serif text-4xl text-slate-950">
                    {result.recipe.name}
                  </h2>
                </div>
                <div className="text-sm text-slate-500">
                  {result.recipe.cooking_time} min •{" "}
                  {formatCurrency(
                    result.savedRecipe?.estimatedCost ??
                      result.recipe.ingredients.length * 0.95,
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  ["Calories", result.recipe.calories],
                  ["Protein", `${result.recipe.protein}g`],
                  ["Carbs", `${result.recipe.carbs}g`],
                  ["Fats", `${result.recipe.fats}g`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-[24px] border border-slate-200/70 bg-slate-50/75 p-4">
                    <p className="text-sm text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Ingredients</p>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
                    {result.recipe.ingredients.map((ingredient) => (
                      <li key={ingredient}>• {ingredient}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Steps</p>
                  <ol className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
                    {result.recipe.steps.map((step, index) => (
                      <li key={step}>
                        <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-950 text-xs text-white">
                          {index + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>

              {!!result.suggestions.length && (
                <div className="rounded-[24px] border border-amber-200 bg-amber-50 p-4 text-sm leading-7 text-amber-900">
                  {result.suggestions.join(" ")}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button type="button" variant="secondary" onClick={() => runGeneration(true)}>
                  Save recipe
                </Button>
                {result.savedRecipe && (
                  <Button type="button" variant="secondary" onClick={toggleFavorite}>
                    {result.savedRecipe.likedBy?.length ? "Favorite saved" : "Mark favorite"}
                  </Button>
                )}
                <Button type="button" variant="ghost" onClick={() => runGeneration(false)}>
                  Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <div className="min-h-[520px] text-sm text-slate-600">
              The provided ingredients need a little more variety. Add a protein or produce
              item and generate again.
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
