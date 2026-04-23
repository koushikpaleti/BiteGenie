import { getCurrentUser } from "@/lib/auth";
import { fail, ok } from "@/lib/http";
import { getDashboardSnapshot } from "@/server/services/dashboard-service";

export async function getDashboardController() {
  const user = await getCurrentUser();

  if (!user) {
    return fail("Unauthorized", 401);
  }

  const snapshot = await getDashboardSnapshot(user);
  return ok(snapshot);
}
