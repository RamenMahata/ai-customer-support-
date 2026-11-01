import pinecone from "../config/pinecone.js";
import env from "../config/env.js";

try {
  const indexInfo = await pinecone.describeIndex(
    env.PINECONE_INDEX_NAME
  );

  console.log(
    "Pinecone index schema:",
    JSON.stringify(indexInfo.schema, null, 2)
  );
} catch (error) {
  console.error("Schema inspection failed:", error);
}