import { z } from "zod";

export const chatSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(2000, "Message cannot exceed 2000 characters"),

  conversationId: z
    .string()
    .uuid("Invalid conversation ID")
    .optional(),
});