import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { getLatestMealPlan } from "@/server/services/meal-plan-service";
import {
  getOrCreateGroceryList,
  updateGroceryItemChecked,
} from "@/server/services/grocery-service";
import { updateGroceryItemSchema } from "@/server/validators/grocery";

export async function getGroceryListController() {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  const latestMealPlan = await getLatestMealPlan(user.id);

  if (!latestMealPlan) {
    return ok(null);
  }

  const hasMeals = latestMealPlan.days.some((day) => day.meals.length > 0);

  if (!hasMeals) {
    return ok(null);
  }

  const groceryList = await getOrCreateGroceryList(user, latestMealPlan);
  return ok(groceryList);
}

export async function updateGroceryListController(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = updateGroceryItemSchema.parse(await request.json());
    const groceryList = await updateGroceryItemChecked(
      user.id,
      body.listId,
      body.itemKey,
      body.checked,
    );
    return ok(groceryList);
  } catch (error) {
    return fail(
      error instanceof Error ? error.message : "Unable to update grocery list",
      400,
    );
  }
}
