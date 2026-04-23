import { registerController } from "@/server/controllers/auth-controller";

export async function POST(request: Request) {
  return registerController(request);
}
