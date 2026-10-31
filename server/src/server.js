import app from "./app.js";
import env from "./config/env.js";
import logger from "./utils/logger.js";

const server = app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT },
    "AI Customer Support API started"
  );
});

const gracefulShutdown = (signal) => {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  server.close((error) => {
    if (error) {
      logger.error(error, "Error during server shutdown");
      process.exitCode = 1;
      return;
    }

    logger.info("HTTP server closed successfully");
    process.exit(0);
  });
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));