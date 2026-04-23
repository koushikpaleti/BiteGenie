import { generateMealController } from "@/server/controllers/ai-controller";

export async function POST(request: Request) {
  return generateMealController(request);
}
