
import express from "express";
import { structuredChatController } from "../controllers/structuredChatController.js";
import validate from "../middleware/validate.js";
import { chatSchema } from "../validators/chatSchema.js";

const router = express.Router();

router.post(
  "/analyze",
  validate(chatSchema),
  structuredChatController
);

export default router;
