import { getHealthStatus } from "../services/healthService.js";
import ApiResponse from "../utils/ApiResponse.js";

export const getHealth = (req, res) => {
  const status = getHealthStatus();

  const response = new ApiResponse(
    200,
    "Health check successful",
    status
  );

  res.status(response.statusCode).json(response);
};