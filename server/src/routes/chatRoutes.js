import express from "express";
import { chatController } from "../controllers/chatController.js";
import validate from "../middleware/validate.js";
import { chatSchema } from "../validators/chatSchema.js";

const router = express.Router();

router.post("/", validate(chatSchema), chatController);

export default router;