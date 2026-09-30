import { z } from "zod";

export const updateMeSchema = z.object({
  name: z.string().min(1).max(120),
});

export const updatePlanSchema = z.object({
  plan: z.enum(["free", "restaurant", "business"]),
});
