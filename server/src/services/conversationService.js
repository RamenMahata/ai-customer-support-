import { randomUUID } from "node:crypto";

const conversations = new Map();

export const generateConversationId = () => {
  return randomUUID();
};

export const createConversation = (conversationId) => {
  conversations.set(conversationId, []);

  return conversationId;
};

export const getConversation = (conversationId) => {
  return conversations.get(conversationId);
};

export const addMessage = (conversationId, message) => {
  const history = conversations.get(conversationId);

  if (!history) {
    throw new Error("Conversation not found");
  }

  history.push(message);
};

export const deleteConversation = (conversationId) => {
  return conversations.delete(conversationId);
};