import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import {
  createMealPlan,
  getLatestMealPlan,
  mutateMealPlan,
} from "@/server/services/meal-plan-service";
import {
  createMealPlanSchema,
  mealPlanActionSchema,
} from "@/server/validators/meal-plan";

export async function getMealPlanController() {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  const mealPlan = await getLatestMealPlan(user.id);
  return ok(mealPlan);
}

export async function createMealPlanController(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = createMealPlanSchema.parse(await request.json());
    const mealPlan = await createMealPlan(user, body);
    return ok(mealPlan, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to generate meal plan", 400);
  }
}

export async function mutateMealPlanController(request: Request, planId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = mealPlanActionSchema.parse(await request.json());
    const mealPlan = await mutateMealPlan(user, planId, body);
    return ok(mealPlan);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update meal plan", 400);
  }
}
