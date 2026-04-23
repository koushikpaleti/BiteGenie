import { toggleFavoriteController } from "@/server/controllers/recipe-controller";

export async function POST(
  _request: Request,
  context: { params: Promise<{ recipeId: string }> },
) {
  const { recipeId } = await context.params;
  return toggleFavoriteController(recipeId);
}
