import {
  getProfileController,
  updateProfileController,
} from "@/server/controllers/profile-controller";

export async function GET() {
  return getProfileController();
}

export async function PATCH(request: Request) {
  return updateProfileController(request);
}
