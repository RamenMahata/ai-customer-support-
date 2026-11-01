import { splitIntoChunks } from "../services/chunkingService.js";

const text = `
Paragraph A contains some useful information.

Paragraph B contains additional information.

Paragraph C contains more details about the policy.

Paragraph D contains the final information.
`;

const chunks = splitIntoChunks(text, 110, 60);

console.log("\nOverlap test:");

chunks.forEach((chunk, index) => {
  console.log(`\nChunk ${index + 1}:`);
  console.log(chunk);
});