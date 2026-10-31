import express from "express";
import { chatController } from "../controllers/chatController.js";
import validate from "../middleware/validate.js";
import { chatSchema } from "../validators/chatSchema.js";
import { streamingChatController } from "../controllers/streamingChatController.js";

const router = express.Router();

router.post("/", validate(chatSchema), chatController);
router.post(
  "/stream",
  validate(chatSchema),
  streamingChatController
);

export default router;