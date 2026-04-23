import { meController } from "@/server/controllers/auth-controller";

export async function GET() {
  return meController();
}
