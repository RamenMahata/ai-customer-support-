import express from "express";
import { agentController } from "../controllers/agentController.js";
import validate from "../middleware/validate.js";
import { chatSchema } from "../validators/chatSchema.js";

const router = express.Router();

router.post(
  "/chat",
  validate(chatSchema),
  agentController
);

export default router;