
import { z } from "zod";

export const customerSupportResponseSchema = z.object({
  intent: z.enum([
    "order_status",
    "refund_request",
    "shipping_issue",
    "product_question",
    "general_support",
    "unknown",
  ]),

  orderId: z.string().nullable(),

  missingInformation: z.array(z.string()),

  suggestHumanHandoff: z.boolean(),

  customerReply: z.string().min(1),
});
