import { runAgent } from "../services/agentService.js";
import { getRelevantHistory } from "../utils/historyManager.js";
import { z } from "zod";

import {
  generateConversationId,
  createConversation,
  getConversation,
  addMessage,
} from "../services/conversationService.js";

export const agentController = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;
    const requestFingerprint = JSON.stringify({
        message: message.trim(),
    });
    const idempotencyKey = req.get("Idempotency-Key");

    if (!idempotencyKey || !z.string().uuid().safeParse(idempotencyKey).success) {
        return res.status(400).json({
            success: false,
            message: "A valid Idempotency-Key UUID header is required.",
        });
    }

    let activeConversationId = conversationId;

    // 1. Create a conversation if no ID is provided.
    if (!activeConversationId) {
      activeConversationId = generateConversationId();
      createConversation(activeConversationId);
    }

    // 2. Retrieve conversation history.
    const history = getConversation(activeConversationId);

    // 3. Reject unknown conversations.
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // 4. Store the customer's message.
    addMessage(activeConversationId, {
      role: "user",
      content: message,
    });

    // 5. Select relevant conversation history.
    const relevantHistory = getRelevantHistory(history);

    // 6. Execute the AI agent.
    const aiResponse = await runAgent(relevantHistory, { idempotencyKey, requestFingerprint });

    // 7. Store the final assistant response.
    addMessage(activeConversationId, {
      role: "assistant",
      content: aiResponse,
    });

    // 8. Return the response.
    return res.status(200).json({
      success: true,
      conversationId: activeConversationId,
      message: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};