
import express from "express";

import {
  approveRefundController,
  rejectRefundController,
  getPendingApprovalsController,
  processRefundController,
} from "../controllers/approvalController.js";

const router = express.Router();

router.get("/", getPendingApprovalsController);
router.post("/:requestId/approve", approveRefundController);
router.post("/:requestId/reject", rejectRefundController);
router.post("/:requestId/process", processRefundController);

export default router;
