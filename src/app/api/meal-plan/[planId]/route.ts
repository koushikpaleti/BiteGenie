import { mutateMealPlanController } from "@/server/controllers/meal-plan-controller";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ planId: string }> },
) {
  const { planId } = await context.params;
  return mutateMealPlanController(request, planId);
}
