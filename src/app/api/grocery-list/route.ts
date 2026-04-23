import {
  getGroceryListController,
  updateGroceryListController,
} from "@/server/controllers/grocery-controller";

export async function GET() {
  return getGroceryListController();
}

export async function PATCH(request: Request) {
  return updateGroceryListController(request);
}
