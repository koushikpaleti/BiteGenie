import { connectToDatabase } from "@/lib/db";
import { RecipeModel } from "@/server/models/Recipe";
import { getLatestMealPlan } from "@/server/services/meal-plan-service";
import { getOrCreateGroceryList } from "@/server/services/grocery-service";
import type { AuthUser, DashboardSnapshot } from "@/types";

export async function getDashboardSnapshot(user: AuthUser) {
  await connectToDatabase();
  const latestMealPlan = await getLatestMealPlan(user.id);
  const groceryList = latestMealPlan
    ? await getOrCreateGroceryList(user, latestMealPlan)
    : null;
  const [savedRecipesCount, favoriteRecipesCount] = await Promise.all([
    RecipeModel.countDocuments({
      createdBy: user.id,
    }),
    RecipeModel.countDocuments({
      likedBy: user.id,
    }),
  ]);

  const macroTrend =
    latestMealPlan?.days.map((day) => ({
      date: day.date,
      calories: day.totalNutrition.calories,
      protein: day.totalNutrition.protein,
      carbs: day.totalNutrition.carbs,
      fats: day.totalNutrition.fats,
      budget: day.estimatedCost,
    })) ?? [];

  const dayCount = Math.max(1, macroTrend.length);
  const totalCalories = macroTrend.reduce((sum, day) => sum + day.calories, 0) / dayCount;
  const totalProtein = macroTrend.reduce((sum, day) => sum + day.protein, 0) / dayCount;
  const totalCarbs = macroTrend.reduce((sum, day) => sum + day.carbs, 0) / dayCount;
  const totalFats = macroTrend.reduce((sum, day) => sum + day.fats, 0) / dayCount;

  return {
    user,
    latestMealPlan,
    macroTrend,
    nutritionCompletion: {
      calories: Math.min(100, Math.round((totalCalories / user.preferences.dailyCalories) * 100)),
      protein: Math.min(100, Math.round((totalProtein / user.preferences.proteinTarget) * 100)),
      carbs: Math.min(100, Math.round((totalCarbs / user.preferences.carbsTarget) * 100)),
      fats: Math.min(100, Math.round((totalFats / user.preferences.fatTarget) * 100)),
    },
    groceryStats: {
      itemCount: groceryList?.items.length ?? 0,
      categories: Object.entries(
        (groceryList?.items ?? []).reduce<Record<string, number>>((accumulator, item) => {
          accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
          return accumulator;
        }, {}),
      ).map(([category, count]) => ({ category, count })),
    },
    savedRecipesCount,
    favoriteRecipesCount,
    insights:
      latestMealPlan?.insights ?? [
        "Create a weekly meal plan to unlock nutrition and grocery insights.",
      ],
  } satisfies DashboardSnapshot;
}
