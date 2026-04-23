import { loginController } from "@/server/controllers/auth-controller";

export async function POST(request: Request) {
  return loginController(request);
}
