
import { generateStructuredResponse } from "../services/llmService.js";

export const structuredChatController = async (req, res, next) => {
  try {
    const { message } = req.body;

    // Convert the customer message into conversation history
    const history = [
      {
        role: "user",
        content: message,
      },
    ];

    // Generate and validate structured response
    const structuredResponse =
      await generateStructuredResponse(history);

    return res.status(200).json({
      success: true,
      data: structuredResponse,
    });
  } catch (error) {
    next(error);
  }
};
