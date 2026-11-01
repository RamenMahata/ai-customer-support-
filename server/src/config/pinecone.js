import { Pinecone } from "@pinecone-database/pinecone";
import env from "./env.js";

if (!env.PINECONE_API_KEY) {
  throw new Error("PINECONE_API_KEY is missing");
}

if (!env.PINECONE_INDEX_NAME) {
  throw new Error("PINECONE_INDEX_NAME is missing");
}

const pinecone = new Pinecone({
  apiKey: env.PINECONE_API_KEY,
});

export const knowledgeIndex = pinecone.index({
  name: env.PINECONE_INDEX_NAME,
});

export default pinecone;