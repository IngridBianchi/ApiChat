import { z } from "zod";

export const historySchema = z.object({
  roomId: z.string().min(1),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

