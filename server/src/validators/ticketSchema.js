import { z } from "zod";

export const ticketSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),

  description: z.string().min(10, "Description must be at least 10 characters"),

  priority: z.enum(["low", "medium", "high"]),
});