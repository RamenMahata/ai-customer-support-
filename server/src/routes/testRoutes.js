import express from "express";
import validate from "../middleware/validate.js";
import { ticketSchema } from "../validators/ticketSchema.js";

const router = express.Router();

router.post("/ticket", validate(ticketSchema), (req, res) => {
  res.status(200).json({
    success: true,
    message: "Ticket data passed validation",
    data: req.body,
  });
});

export default router;