import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { saveRecipe } from "@/server/services/recipe-service";
import {
  listRecipesForUser,
  toggleFavoriteRecipe,
} from "@/server/services/recipe-service";
import { saveRecipeSchema } from "@/server/validators/recipes";

export async function listRecipesController() {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  const recipes = await listRecipesForUser(user.id);
  return ok(recipes);
}

export async function saveRecipeController(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = saveRecipeSchema.parse(await request.json());
    const recipe = await saveRecipe(body, user.id);
    return ok(recipe, { status: 201 });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to save recipe", 400);
  }
}

export async function toggleFavoriteController(recipeId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const result = await toggleFavoriteRecipe(recipeId, user.id);
    return ok(result);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update favorite", 400);
  }
}
