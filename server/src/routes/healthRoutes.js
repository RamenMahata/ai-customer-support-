import express from "express";
import {getHealth} from "../controllers/healthController.js";

const router = express.Router();

router.get("/", getHealth);

router.get("/test-error", (req, res, next) => {
  const error = new Error("This is a test error");
  error.statusCode = 400;

  next(error);
});

export default router;