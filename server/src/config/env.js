import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};

export default env;