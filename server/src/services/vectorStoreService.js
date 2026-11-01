import { knowledgeIndex } from "../config/pinecone.js";

const BATCH_SIZE = 96;

export const storeVectors = async (chunks) => {
  if (!Array.isArray(chunks) || chunks.length === 0) {
    throw new Error("No document chunks provided");
  }

  let totalUpserted = 0;

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const batch = chunks.slice(i, i + BATCH_SIZE);

    const documents = batch.map((chunk) => ({
      _id: chunk.id,
      chunk_text: chunk.content,
      title: chunk.source,
      documentId: chunk.documentId,
    }));

    const result = await knowledgeIndex.documents.upsert({
      documents,
    });

    totalUpserted += result.upsertedCount ?? documents.length;
  }

  return {
    upsertedCount: totalUpserted,
  };
};