import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { updateProfile } from "@/server/services/auth-service";
import { updateProfileSchema } from "@/server/validators/profile";

export async function getProfileController() {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  return ok(user);
}

export async function updateProfileController(request: Request) {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  try {
    const body = updateProfileSchema.parse(await request.json());
    const updated = await updateProfile(user.id, body);
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update profile", 400);
  }
}
