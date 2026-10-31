
import openrouter from "../config/llm.js";
import env from "../config/env.js";
import customerSupportPrompt from "../prompts/customerSupportPrompt.js";
import customerSupportJsonSchema from "../schemas/customerSupportJsonSchema.js";
import { parseStructuredResponse } from "../utils/parseStructuredResponse.js";

// 1. Normal LLM response
export const generateResponse = async (history) => {
  const response = await openrouter.chat.send({
    chatRequest: {
      model: env.OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: customerSupportPrompt,
        },
        ...history,
      ],
      stream: false,
    },
  });

  const assistantMessage =
    response.choices?.[0]?.message?.content;

  if (
    typeof assistantMessage !== "string" ||
    !assistantMessage.trim()
  ) {
    throw new Error("The LLM returned an empty or unexpected response");
  }

  return assistantMessage;
};

// 2. Streaming LLM response
export const generateStreamingResponse = async (history) => {
  const stream = await openrouter.chat.send({
    chatRequest: {
      model: env.OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content: customerSupportPrompt,
        },
        ...history,
      ],
      stream: true,
    },
  });

  return stream;
};

// 3. Read and assemble streaming response
export const readStreamingResponse = async (stream, onChunk) => {
  let completeResponse = "";

  for await (const chunk of stream) {
    const content = chunk.choices?.[0]?.delta?.content;

    if (typeof content === "string" && content.length > 0) {
      completeResponse += content;
      onChunk(content);
    }
  }

  return completeResponse;
};

// 4. Generate structured LLM response
export const generateStructuredResponse = async (history) => {
  const response = await openrouter.chat.send({
    chatRequest: {
      model: env.OPENROUTER_MODEL,

      messages: [
        {
          role: "system",
          content: `
            You are an AI customer support request analyzer.

            Analyze the customer's conversation.

            Return exactly the fields defined in the supplied JSON Schema.

            INTENT CLASSIFICATION:
            - Use "order_status" for order tracking or status inquiries.
            - Use "refund_request" for refund requests.
            - Use "shipping_issue" for delivery delays or shipping problems.
            - Use "product_question" for product-related questions.
            - Use "general_support" for general customer support.
            - Use "unknown" if the intent cannot be identified.
            - Always use one of the exact enum values defined in the schema.

            ORDER ID EXTRACTION:
            - Use the exact field name "orderId", never "orderID".
            - Never invent an order ID.
            - If the customer provides an order ID, extract it.
            - If the order ID is missing, return null.

            MISSING INFORMATION:
            - If the customer requests an order status or reports a delivery issue without providing an order ID, set orderId to null.
            - When orderId is null and an order ID is required, include "orderId" in missingInformation.
            - Never return an empty missingInformation array when required information is unavailable.
            - Only include information that is genuinely missing.
            - If no information is missing, return an empty array.

            HUMAN HANDOFF:
            - Use the exact field name "suggestHumanHandoff".
            - Suggest human handoff when appropriate.
            - This is only a recommendation, not an actual handoff.

            CUSTOMER REPLY:
            - customerReply must be an actual helpful response from the support assistant, not a repetition of the customer's message.
            - Acknowledge the customer's concern and explain the next step.
            - Do not claim that an order was checked or a refund was processed.
            - Do not claim to have retrieved order information.
            - Never say "Let me check the current status" or imply that an external lookup is happening.
            - Explain that the application can check the order once the appropriate lookup operation is available.
            - Do not promise a delivery update without verified data.

            OUTPUT REQUIREMENTS:
            - Include every required field.
            - Do not add extra fields.
            - Follow the supplied JSON Schema exactly.
          `,
        },
        ...history,
      ],

      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: "customer_support_response",
          strict: true,
          schema: customerSupportJsonSchema,
        },
      },

      // Only use providers that support requested parameters
      provider: {
        requireParameters: true,
      },

      stream: false,
    },
  });

  // Temporary debugging information
  console.log("SELECTED MODEL:", response.model);

  console.log(
    "FINISH REASON:",
    response.choices?.[0]?.finish_reason
  );

  const assistantMessage =
    response.choices?.[0]?.message;

  console.log("RAW LLM RESPONSE:");
  console.dir(assistantMessage, { depth: null });

  const structuredContent = assistantMessage?.content;

  if (
    typeof structuredContent !== "string" ||
    !structuredContent.trim()
  ) {
    throw new Error("The LLM returned an empty structured response");
  }

  // Parse JSON and validate using Zod
  return parseStructuredResponse(structuredContent);
};
