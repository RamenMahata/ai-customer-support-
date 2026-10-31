import { generateResponse } from "../services/llmService.js";
import { getRelevantHistory } from "../utils/historyManager.js";

import {
  generateConversationId,
  createConversation,
  getConversation,
  addMessage,
} from "../services/conversationService.js";

export const chatController = async (req, res, next) => {
  try {
    const { message, conversationId } = req.body;

    let activeConversationId = conversationId;
    let history;

    // 1. Create a new conversation if no ID is provided
    if (!activeConversationId) {
      activeConversationId = generateConversationId();
      createConversation(activeConversationId);
    }

    // 2. Retrieve conversation history
    history = getConversation(activeConversationId);

    // 3. Reject unknown conversation IDs
    if (!history) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // 4. Store the user's message
    addMessage(activeConversationId, {
      role: "user",
      content: message,
    });

    // 5. Generate AI response using relevant history
    const relevantHistory = getRelevantHistory(history);
    const aiResponse = await generateResponse(relevantHistory);

    // 6. Store the assistant's response
    addMessage(activeConversationId, {
      role: "assistant",
      content: aiResponse,
    });

    // 7. Return response and conversation ID
    return res.status(200).json({
      success: true,
      conversationId: activeConversationId,
      message: aiResponse,
    });
  } catch (error) {
    next(error);
  }
};