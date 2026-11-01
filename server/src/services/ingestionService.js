import { loadDocuments } from "./documentLoader.js";
import { splitIntoChunks } from "./chunkingService.js";

// export const ingestDocuments = async () => {
//   const documents = await loadDocuments();

//   const chunksToStore = [];

//   for (const document of documents) {
//     const chunks = splitIntoChunks(document.content, 500, 100);

//     for (let index = 0; index < chunks.length; index++) {
//       chunksToStore.push({
//         id: `${document.id}#chunk-${index + 1}`,
//         documentId: document.id,
//         source: document.source,
//         content: chunks[index],
//       });
//     }
//   }

//   return chunksToStore;
// };

export const ingestDocuments = async () => {
  const documents = await loadDocuments();

  const chunksToStore = [];

  console.log("Documents loaded:", documents.length);

  for (const document of documents) {
    const chunks = splitIntoChunks(document.content, 500, 100);

    console.log(`\nDocument: ${document.source}`);
    console.log("Content length:", document.content.length);
    console.log("Generated chunks:", chunks.length);

    for (let index = 0; index < chunks.length; index++) {
      chunksToStore.push({
        id: `${document.id}#chunk-${index + 1}`,
        documentId: document.id,
        source: document.source,
        content: chunks[index],
      });
    }
  }

  console.log("\nTotal generated chunks:", chunksToStore.length);

  return chunksToStore;
};