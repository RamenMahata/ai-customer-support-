import express from "express";
import cors from "cors";
import healthRoutes from "./routes/healthRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";
import notFound from "./middleware/notFoundMiddleware.js";
import testRoutes from "./routes/testRoutes.js";
import requestLogger from "./middleware/requestLogger.js";
import chatRoutes from "./routes/chatRoutes.js";


const app = express();

// Global middleware
app.use(cors());
app.use(express.json());

app.use(requestLogger);

// Routes
app.use("/api/health", healthRoutes);
app.use("/api/test", testRoutes);
app.use("/api/chat", chatRoutes);

// Handle unknown routes
app.use(notFound);

// Error-handling middleware (keep it after routes)
app.use(errorHandler);

export default app;