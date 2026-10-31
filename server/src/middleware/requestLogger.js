import pinoHttp from "pino-http";
import logger from "../utils/logger.js";

const requestLogger = pinoHttp({
  logger,
});

export default requestLogger;