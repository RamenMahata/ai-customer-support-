import dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  

  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,

  OPENROUTER_MODEL:
    process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini",
  OPENROUTER_EMBEDDING_MODEL:
    process.env.OPENROUTER_EMBEDDING_MODEL || "openai/text-embedding-3-small",
  
  PINECONE_API_KEY: process.env.PINECONE_API_KEY,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME,
};

export default env;