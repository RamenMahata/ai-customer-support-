import { loadDocuments } from "../services/documentLoader.js";

const documents = await loadDocuments();

console.log("Documents loaded:", documents.length);

for (const document of documents) {
  console.log("\nSource:", document.source);
  console.log("Content:\n", document.content);
}