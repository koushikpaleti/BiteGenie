import {
  createMealPlanController,
  getMealPlanController,
} from "@/server/controllers/meal-plan-controller";

export async function GET() {
  return getMealPlanController();
}

export async function POST(request: Request) {
  return createMealPlanController(request);
}
