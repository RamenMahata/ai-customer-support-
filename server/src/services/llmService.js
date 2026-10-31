import openrouter from "../config/llm.js";
import env from "../config/env.js";
import customerSupportPrompt from "../prompts/customerSupportPrompt.js";

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