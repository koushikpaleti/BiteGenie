import { getDashboardController } from "@/server/controllers/dashboard-controller";

export async function GET() {
  return getDashboardController();
}
