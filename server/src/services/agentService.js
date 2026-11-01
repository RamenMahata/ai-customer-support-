
import { generateToolCallResponse } from "./llmService.js";
import { retrieveKnowledgeContext } from "./ragService.js";

import {
  executeTool,
  getToolMetadata,
} from "../tools/toolExecutor.js";

const MAX_TOOL_ROUNDS = 5;

// Validate the response received from the LLM.
const validateAgentResponse = (response) => {
  if (
    !response ||
    typeof response !== "object" ||
    Array.isArray(response)
  ) {
    throw new Error("Invalid response received from LLM");
  }

  if (!Array.isArray(response.toolCalls)) {
    throw new Error("Invalid tool calls returned by LLM");
  }

  // No tool calls: validate the final response later.
  if (response.toolCalls.length === 0) {
    return response;
  }

  const assistantMessage = response.assistantMessage;

  // 1. Validate assistant message.
  if (
    !assistantMessage ||
    typeof assistantMessage !== "object" ||
    Array.isArray(assistantMessage)
  ) {
    throw new Error("Invalid assistant tool-call message");
  }

  if (assistantMessage.role !== "assistant") {
    throw new Error(
      "Assistant tool-call message must have assistant role"
    );
  }

  // 2. Validate assistant message tool calls.
  if (!Array.isArray(assistantMessage.toolCalls)) {
    throw new Error(
      "Assistant message tool calls must be an array"
    );
  }

  // 3. Both representations must contain the same number of calls.
  if (
    assistantMessage.toolCalls.length !==
    response.toolCalls.length
  ) {
    throw new Error("Tool-call count mismatch");
  }

  // 4. Validate individual tool calls.
  const seenToolCallIds = new Set();

  for (let i = 0; i < response.toolCalls.length; i++) {
    const toolCall = response.toolCalls[i];
    const assistantToolCall = assistantMessage.toolCalls[i];

    // Validate tool-call object.
    if (
      !toolCall ||
      typeof toolCall !== "object" ||
      Array.isArray(toolCall)
    ) {
      throw new Error("Invalid tool-call object");
    }

    // Validate tool-call ID.
    if (
      typeof toolCall.id !== "string" ||
      !toolCall.id.trim()
    ) {
      throw new Error("Tool call ID is missing or invalid");
    }

    // Reject duplicate IDs.
    if (seenToolCallIds.has(toolCall.id)) {
      throw new Error("Duplicate tool-call ID detected");
    }

    seenToolCallIds.add(toolCall.id);

    // Validate function object.
    if (
      !toolCall.function ||
      typeof toolCall.function !== "object" ||
      Array.isArray(toolCall.function)
    ) {
      throw new Error("Invalid tool-call function");
    }

    // Validate function name.
    if (
      typeof toolCall.function.name !== "string" ||
      !toolCall.function.name.trim()
    ) {
      throw new Error(
        "Tool function name is missing or invalid"
      );
    }

    // Validate arguments are a string.
    if (typeof toolCall.function.arguments !== "string") {
      throw new Error(
        "Tool arguments must be a JSON string"
      );
    }

    // 5. Validate JSON syntax and object structure.
    let parsedArguments;

    try {
      parsedArguments = JSON.parse(
        toolCall.function.arguments
      );
    } catch {
      throw new Error(
        "Tool arguments contain invalid JSON"
      );
    }

    if (
      parsedArguments === null ||
      typeof parsedArguments !== "object" ||
      Array.isArray(parsedArguments)
    ) {
      throw new Error(
        "Tool arguments must be a JSON object"
      );
    }

    // 6. Validate corresponding assistant tool call.
    if (
      !assistantToolCall ||
      typeof assistantToolCall !== "object" ||
      Array.isArray(assistantToolCall)
    ) {
      throw new Error(
        "Invalid assistant tool-call entry"
      );
    }

    if (assistantToolCall.id !== toolCall.id) {
      throw new Error(
        "Assistant tool-call ID mismatch"
      );
    }

    if (
      assistantToolCall.function?.name !==
      toolCall.function.name
    ) {
      throw new Error(
        "Assistant tool-call function name mismatch"
      );
    }
  }

  return response;
};

// Safely execute a tool.
// Unexpected exceptions become standardized tool failures.
const executeSafely = async (toolCall, context, execute) => {
  try {
    return await execute(toolCall, context);
  } catch (error) {
    return {
      toolCallId: toolCall.id,
      toolName: toolCall.function.name,
      result: {
        success: false,
        error: "TOOL_EXECUTION_FAILED",
        message:
          error?.message || "Tool execution failed.",
      },
    };
  }
};

// Safely schedule tool execution.
const executeToolCallsSafely = async (
  toolCalls,
  context,
  execute
) => {
  const readCalls = [];
  const writeCalls = [];

  // Store results by original tool-call position.
  const results = new Array(toolCalls.length);

  // 1. Classify tools using trusted backend metadata.
  toolCalls.forEach((toolCall, index) => {
    const toolName = toolCall?.function?.name;
    const metadata = getToolMetadata(toolName);

    // Reject unknown tools immediately.
    if (!metadata) {
      results[index] = {
        toolCallId: toolCall?.id,
        toolName,
        result: {
          success: false,
          error: "UNKNOWN_TOOL",
          message: `Tool '${toolName}' is not registered.`,
        },
      };

      return;
    }

    const isSafeRead =
      metadata.executionType === "read" &&
      metadata.requiresHumanApproval !== true;

    if (isSafeRead) {
      readCalls.push({ toolCall, index });
    } else {
      // State-changing or approval-protected tools
      // are executed sequentially.
      writeCalls.push({ toolCall, index });
    }
  });

  // 2. Execute independent read-only tools in parallel.
  // Each execution is protected against unexpected exceptions.
  const readResults = await Promise.all(
    readCalls.map(async ({ toolCall, index }) => ({
      index,
      result: await executeSafely(
        toolCall,
        context,
        execute
      ),
    }))
  );

  for (const item of readResults) {
    results[item.index] = item.result;
  }

  // 3. Check whether any read-only operation failed.
  const readFailure = readResults.some(
    ({ result }) => result?.result?.success !== true
  );

  // 4. Fail closed if any read operation fails.
  if (readFailure) {
    for (const { toolCall, index } of writeCalls) {
      results[index] = {
        toolCallId: toolCall?.id,
        toolName: toolCall?.function?.name,
        result: {
          success: false,
          error: "DEPENDENCY_FAILED",
          message:
            "A read-only operation failed. State-changing operations were blocked for safety.",
        },
      };
    }

    return results;
  }

  // 5. Execute state-changing tools sequentially.
  for (const { toolCall, index } of writeCalls) {
    results[index] = await executeSafely(
      toolCall,
      context,
      execute
    );
  }

  // 6. Preserve original tool-call order.
  return results;
};

// Run the AI agent.
export const runAgent = async (
  history,
  {
    generateResponse = generateToolCallResponse,
    execute = executeTool,
    retrieveKnowledge = retrieveKnowledgeContext,
    idempotencyKey,
    requestFingerprint,
  } = {}
) => {
  // Work on a copy to avoid modifying stored conversation history.
  const agentHistory = [...history];

  const context = {
    idempotencyKey,
    requestFingerprint,
  };

  // Step 1: Find the latest customer message.
  const latestUserMessage = [...history]
    .reverse()
    .find((message) => message.role === "user");

  if (!latestUserMessage?.content) {
    throw new Error("No customer message found in conversation");
  }

  // Step 2: Retrieve relevant knowledge once.
  const knowledgeContext = await retrieveKnowledge(
    latestUserMessage.content
  );

  // Step 3: Ask the LLM whether a tool is needed.
  let response = validateAgentResponse(
    await generateResponse(agentHistory, knowledgeContext)
  );

  let rounds = 0;

  // Step 4: Continue while the LLM requests tools.
  while (response.toolCalls.length > 0) {
    // Prevent unlimited tool execution.
    if (rounds >= MAX_TOOL_ROUNDS) {
      throw new Error(
        "Maximum tool execution rounds exceeded"
      );
    }

    // Add the assistant's original tool-call message.
    agentHistory.push(response.assistantMessage);

    // Execute tools using the safe scheduler.
    const toolResults = await executeToolCallsSafely(
      response.toolCalls,
      context,
      execute
    );

    // Add tool results to the conversation.
    for (const toolResult of toolResults) {
      agentHistory.push({
        role: "tool",
        toolCallId: toolResult.toolCallId,
        content: JSON.stringify(toolResult.result),
      });
    }

    rounds++;

    // Ask the LLM what to do next.
    // The same RAG context is retained across rounds.
    response = validateAgentResponse(
      await generateResponse(agentHistory, knowledgeContext)
    );
  }

  // Step 5: Validate final customer-facing response.
  if (
    typeof response.content !== "string" ||
    !response.content.trim()
  ) {
    throw new Error("Agent returned an empty response");
  }

  return response.content;
};