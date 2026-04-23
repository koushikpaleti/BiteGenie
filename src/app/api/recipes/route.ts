import {
  listRecipesController,
  saveRecipeController,
} from "@/server/controllers/recipe-controller";

export async function GET() {
  return listRecipesController();
}

export async function POST(request: Request) {
  return saveRecipeController(request);
}
