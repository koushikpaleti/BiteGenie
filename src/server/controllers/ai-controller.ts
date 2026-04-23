import { ZodError } from "zod";

import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { generateMealWithAi } from "@/server/services/ai-meal-service";
import { generateMealSchema } from "@/server/validators/generate-meal";

export async function generateMealController(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = generateMealSchema.parse(await request.json());
    const result = await generateMealWithAi({
      ...body,
      user,
    });

    return ok(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to generate meal";

    if (
      message.includes("OPENAI_API_KEY") ||
      message.includes("GROQ_API_KEY") ||
      message.includes("XAI_API_KEY")
    ) {
      return fail(
        "AI generator is not configured yet. Add OPENAI_API_KEY, GROQ_API_KEY, or XAI_API_KEY to .env.local, then restart the dev server.",
        400,
      );
    }

    if (error instanceof ZodError) {
      return fail(
        "The AI returned an invalid recipe format. Please generate again.",
        400,
      );
    }

    return fail(message, 400);
  }
}
