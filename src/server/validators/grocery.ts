import { z } from "zod";

export const updateGroceryItemSchema = z.object({
  listId: z.string(),
  itemKey: z.string().min(3),
  checked: z.boolean(),
});
