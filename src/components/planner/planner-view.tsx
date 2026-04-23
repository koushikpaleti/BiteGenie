"use client";

import { addDays, format, isValid, parseISO, startOfWeek } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronRight,
  Plus,
  RefreshCcw,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { useDeferredValue, useMemo, useState, useTransition } from "react";
import useSWR from "swr";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch, swrFetcher } from "@/lib/api-client";
import { cn, formatCurrency, formatDisplayDate, formatIsoDate } from "@/lib/utils";
import type { MealPlanPayload, PlannedMeal, RecipeDocumentShape } from "@/types";

const visibleMealTypes = ["breakfast", "lunch", "dinner"] as const;

type VisibleMealType = (typeof visibleMealTypes)[number];

interface PickerState {
  dayId: string;
  dayDate: string;
  mealType: VisibleMealType;
  existingMealId?: string;
}

function getWeekStartIso() {
  return formatIsoDate(startOfWeek(new Date(), { weekStartsOn: 1 }));
}

function buildPlaceholderDays(startDate: string) {
  const parsed = parseISO(startDate);
  const base = isValid(parsed)
    ? parsed
    : startOfWeek(new Date(), { weekStartsOn: 1 });

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(base, index);
    return {
      _id: `placeholder-${index}`,
      date: formatIsoDate(date),
      meals: [] as MealPlanPayload["days"][number]["meals"],
      totalNutrition: { calories: 0, protein: 0, carbs: 0, fats: 0 },
      estimatedCost: 0,
    };
  });
}

export function PlannerView() {
  const {
    data: mealPlan,
    isLoading,
    mutate,
  } = useSWR<MealPlanPayload | null>("/api/meal-plan", swrFetcher);
  const { data: recipes, isLoading: isRecipesLoading } = useSWR<RecipeDocumentShape[]>(
    "/api/recipes",
    swrFetcher,
  );
  const [picker, setPicker] = useState<PickerState | null>(null);
  const [, startTransition] = useTransition();

  const weekStart = mealPlan?.startDate ?? getWeekStartIso();
  const days = mealPlan?.days.length ? mealPlan.days : buildPlaceholderDays(weekStart);

  async function createEmptyWeek() {
    const created = await apiFetch<MealPlanPayload>("/api/meal-plan", {
      method: "POST",
      body: JSON.stringify({
        startDate: getWeekStartIso(),
        days: 7,
        strategy: "empty",
      }),
    });
    await mutate(created, false);
    return created;
  }

  function startBlankWeek() {
    startTransition(async () => {
      try {
        await createEmptyWeek();
        toast.success("Started a blank weekly planner");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to start blank week");
      }
    });
  }

  async function ensurePlan() {
    return mealPlan ?? createEmptyWeek();
  }

  async function generateSmartWeek() {
    startTransition(async () => {
      try {
        const created = await apiFetch<MealPlanPayload>("/api/meal-plan", {
          method: "POST",
          body: JSON.stringify({
            startDate: getWeekStartIso(),
            days: 7,
            strategy: "smart",
          }),
        });
        await mutate(created, false);
        toast.success("Generated a full smart week");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to generate week");
      }
    });
  }

  async function refreshGroceryList() {
    try {
      const plan = await ensurePlan();
      if (!plan.days.some((day) => day.meals.length > 0)) {
        toast.error("Add at least one meal before updating the grocery list");
        return;
      }

      await apiFetch("/api/grocery-list");
      toast.success("Grocery list updated from your current week");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update grocery list");
    }
  }

  function mutateAction(planId: string, body: Record<string, unknown>, successMessage: string) {
    startTransition(async () => {
      try {
        const updated = await apiFetch<MealPlanPayload>(`/api/meal-plan/${planId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        await mutate(updated, false);
        toast.success(successMessage);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update planner");
      }
    });
  }

  async function addRecipeToSlot(recipeId: string) {
    if (!picker) {
      return;
    }

    try {
      const plan = await ensurePlan();
      const resolvedDay =
        plan.days.find((day) => day._id === picker.dayId) ??
        plan.days.find((day) => day.date === picker.dayDate);

      if (!resolvedDay?._id) {
        throw new Error("Unable to locate the selected day in your planner");
      }

      const updated = await apiFetch<MealPlanPayload>(`/api/meal-plan/${plan._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "add_recipe_to_day",
          dayId: resolvedDay._id,
          mealType: picker.mealType,
          recipeId,
        }),
      });
      await mutate(updated, false);
      setPicker(null);
      toast.success("Meal added to planner");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add recipe");
    }
  }

  if (isLoading || !recipes || isRecipesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-28 w-full" />
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    );
  }

  const weeklyCalories = Math.round(
    days.reduce((sum, day) => sum + day.totalNutrition.calories, 0),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Planner</p>
          <h1 className="mt-2 font-serif text-5xl tracking-tight text-slate-950">
            Weekly Planner
          </h1>
          <p className="mt-3 text-lg text-slate-500">
            {weeklyCalories.toLocaleString()} kcal planned this week
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="secondary" onClick={startBlankWeek}>
            <Plus className="mr-2 h-4 w-4" />
            Start blank week
          </Button>
          <Button type="button" variant="secondary" onClick={generateSmartWeek}>
            <Sparkles className="mr-2 h-4 w-4" />
            Auto-fill week
          </Button>
          <Button type="button" variant="secondary" onClick={refreshGroceryList}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Update Grocery List
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[140px_repeat(3,minmax(0,1fr))] gap-3 px-2 text-sm font-semibold text-[#9b6848]">
        <div>DAY</div>
        <div className="text-center">Breakfast</div>
        <div className="text-center">Lunch</div>
        <div className="text-center">Dinner</div>
      </div>

      <div className="space-y-4">
        {days.map((day, index) => (
          <motion.div
            key={day._id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <Panel className="rounded-[30px] bg-white/80 p-3 sm:p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-[140px_repeat(3,minmax(0,1fr))] md:items-stretch">
                <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4">
                  <p className="text-3xl font-semibold text-slate-950">
                    {format(parseISO(day.date), "EEE")}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{formatDisplayDate(day.date)}</p>
                  <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">
                    {Math.round(day.totalNutrition.calories)} kcal
                  </p>
                </div>

                {visibleMealTypes.map((mealType) => {
                  const meal = day.meals.find((entry) => entry.mealType === mealType);
                  const dayId = day._id ?? day.date;

                  if (!meal) {
                    return (
                      <button
                        key={mealType}
                        type="button"
                        onClick={() =>
                          setPicker({
                            dayId,
                            dayDate: day.date,
                            mealType,
                          })
                        }
                        className={cn(
                          "group flex min-h-[112px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-white/70 text-slate-400 transition hover:border-[#f59e0b] hover:text-[#f59e0b]",
                          picker?.dayId === dayId &&
                            picker?.mealType === mealType &&
                            "border-[#f59e0b] text-[#f59e0b]",
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Plus className="h-5 w-5" />
                          <span className="text-sm font-medium capitalize">{mealType}</span>
                        </div>
                      </button>
                    );
                  }

                  return (
                    <MealSlotCard
                      key={mealType}
                      meal={meal}
                      onReplace={() =>
                        setPicker({
                          dayId,
                          dayDate: day.date,
                          mealType,
                          existingMealId: meal._id,
                        })
                      }
                      onIncrease={() =>
                        mealPlan &&
                        mutateAction(
                          mealPlan._id,
                          {
                            action: "update_servings",
                            dayId,
                            mealId: meal._id,
                            servings: Math.min(4, meal.servings + 0.5),
                          },
                          "Servings updated",
                        )
                      }
                      onDecrease={() =>
                        mealPlan &&
                        mutateAction(
                          mealPlan._id,
                          {
                            action: "update_servings",
                            dayId,
                            mealId: meal._id,
                            servings: Math.max(0.5, meal.servings - 0.5),
                          },
                          "Servings updated",
                        )
                      }
                      onRemove={() =>
                        mealPlan &&
                        mutateAction(
                          mealPlan._id,
                          {
                            action: "remove_meal",
                            dayId,
                            mealId: meal._id,
                          },
                          "Meal removed",
                        )
                      }
                    />
                  );
                })}
              </div>
            </Panel>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {picker && (
          <RecipePickerModal
            recipes={recipes}
            picker={picker}
            onClose={() => setPicker(null)}
            onSelectRecipe={addRecipeToSlot}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MealSlotCard({
  meal,
  onReplace,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  meal: PlannedMeal;
  onReplace: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex min-h-[112px] flex-col justify-between rounded-[24px] border border-slate-200/70 bg-white/90 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">{meal.recipe?.name}</p>
          <p className="mt-1 text-xs text-slate-500">
            {meal.recipe?.cookingTime} min cook • {Math.round(meal.nutrition.calories)} kcal
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
          <button type="button" onClick={onDecrease}>
            -
          </button>
          <span>{meal.servings}x</span>
          <button type="button" onClick={onIncrease}>
            +
          </button>
        </div>

        <button
          type="button"
          onClick={onReplace}
          className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition hover:text-slate-950"
        >
          Change
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function RecipePickerModal({
  recipes,
  picker,
  onClose,
  onSelectRecipe,
}: {
  recipes: RecipeDocumentShape[];
  picker: PickerState;
  onClose: () => void;
  onSelectRecipe: (recipeId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [dietFilter, setDietFilter] = useState("all");
  const deferredQuery = useDeferredValue(query);

  const filteredRecipes = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();

            return recipes
      .filter((recipe) => recipe.mealType === picker.mealType)
      .filter(
        (recipe) =>
          dietFilter === "all" ||
          recipe.dietaryTags.includes(
            dietFilter as RecipeDocumentShape["dietaryTags"][number],
          ),
      )
      .filter((recipe) => {
        if (!normalized) {
          return true;
        }

        return (
          recipe.name.toLowerCase().includes(normalized) ||
          recipe.ingredients.some((ingredient) =>
            ingredient.name.toLowerCase().includes(normalized),
          )
        );
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [recipes, picker.mealType, dietFilter, deferredQuery]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        className="flex max-h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[32px] border border-white/70 bg-[#fdfbf8] shadow-[0_40px_120px_-40px_rgba(15,23,42,0.45)]"
      >
        <div className="flex items-start justify-between border-b border-slate-200/70 px-6 py-5">
          <div>
            <Badge>{picker.mealType}</Badge>
            <h2 className="mt-3 font-serif text-4xl text-slate-950">Add meal to planner</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {recipes.length}+ Indian and India-available recipes in the database.{" "}
              {filteredRecipes.length} match this slot right now.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid gap-4 border-b border-slate-200/70 px-6 py-4 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by recipe name or ingredient"
              className="pl-11"
            />
          </div>
          <Select value={dietFilter} onChange={(event) => setDietFilter(event.target.value)}>
            <option value="all">All diets</option>
            <option value="balanced">Balanced</option>
            <option value="high-protein">High Protein</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="pescatarian">Pescatarian</option>
            <option value="keto">Keto</option>
          </Select>
        </div>

        <div className="grid gap-4 overflow-y-auto px-6 py-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <div
              key={recipe._id}
              className="flex flex-col rounded-[24px] border border-slate-200/70 bg-white/85 p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{recipe.name}</p>
                  <p className="mt-1 text-sm text-slate-500">
                    {recipe.cookingTime} min • {recipe.nutrition.calories} kcal •{" "}
                    {formatCurrency(recipe.estimatedCost)}
                  </p>
                </div>
                <Badge className="capitalize">{recipe.mealType}</Badge>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {recipe.dietaryTags.slice(0, 3).map((tag) => (
                  <Badge key={tag} className="capitalize">
                    {tag}
                  </Badge>
                ))}
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">{recipe.notes}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">
                {recipe.ingredients.slice(0, 4).map((ingredient) => ingredient.name).join(", ")}
              </p>

              <Button
                type="button"
                className="mt-5 justify-center"
                onClick={() => onSelectRecipe(recipe._id!)}
              >
                Add recipe
              </Button>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
