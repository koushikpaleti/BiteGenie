import { logoutController } from "@/server/controllers/auth-controller";

export async function POST() {
  return logoutController();
}
