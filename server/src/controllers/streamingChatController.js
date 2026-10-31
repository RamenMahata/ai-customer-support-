
import {
  generateStreamingResponse,
  readStreamingResponse,
} from "../services/llmService.js";

import {
  generateConversationId,
  createConversation,
  getConversation,
  addMessage,
} from "../services/conversationService.js";

import { getRelevantHistory } from "../utils/historyManager.js";

export const streamingChatController = async (req, res, next) => {
  let clientDisconnected = false;

  try {
    const { message, conversationId } = req.body;

    let activeConversationId = conversationId;

    // Detect client disconnection
    res.on("close", () => {
      if (!res.writableEnded) {
        clientDisconnected = true;
        console.log("Client disconnected during streaming");
      }
    });

    // Create or retrieve conversation
    if (!activeConversationId) {
      activeConversationId = generateConversationId();
      createConversation(activeConversationId);
    }

    const history = getConversation(activeConversationId);

    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Save user message
    addMessage(activeConversationId, {
      role: "user",
      content: message,
    });

    // Set SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    // Send conversation ID to client
    res.write(
      `data: ${JSON.stringify({
        conversationId: activeConversationId,
      })}\n\n`
    );

    // Generate streaming response
    const relevantHistory = getRelevantHistory(history);

    const stream = await generateStreamingResponse(relevantHistory);

    // Read and forward streaming chunks
    const completeResponse = await readStreamingResponse(
      stream,
      (content) => {
        if (
          !clientDisconnected &&
          !res.destroyed &&
          !res.writableEnded
        ) {
          res.write(
            `data: ${JSON.stringify({ content })}\n\n`
          );
        }
      }
    );

    // Validate complete response
    if (!completeResponse.trim()) {
      throw new Error("LLM returned an empty response");
    }

    // Save complete assistant response
    addMessage(activeConversationId, {
      role: "assistant",
      content: completeResponse,
    });

    // Notify client that streaming is complete
    if (
      !clientDisconnected &&
      !res.destroyed &&
      !res.writableEnded
    ) {
      res.write("data: [DONE]\n\n");
      res.end();
    }
  } catch (error) {
    console.error("Streaming chat error:", error);

    if (res.headersSent) {
      if (
        !clientDisconnected &&
        !res.destroyed &&
        !res.writableEnded
      ) {
        res.write(
          `data: ${JSON.stringify({
            error: "Failed to generate response",
          })}\n\n`
        );

        res.end();
      }
    } else {
      next(error);
    }
  }
};
