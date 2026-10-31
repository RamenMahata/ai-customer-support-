
import {
  approveRefund,
  rejectRefund,
  getPendingApprovals,
} from "../services/approvalService.js";
import { processRefund } from "../services/refundExecutionService.js";

export const approveRefundController = async (req, res, next) => {
  try {
    const result = await approveRefund(req.params.requestId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const rejectRefundController = async (req, res, next) => {
  try {
    const result = await rejectRefund(req.params.requestId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getPendingApprovalsController = async (req, res, next) => {
  try {
    const requests = await getPendingApprovals();

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};


export const processRefundController = async (req, res, next) => {
  try {
    const result = await processRefund(req.params.requestId);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
