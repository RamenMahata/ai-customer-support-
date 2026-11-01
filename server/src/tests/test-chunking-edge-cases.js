import assert from "node:assert/strict";
import { splitIntoChunks } from "../services/chunkingService.js";

// 1. Empty input
assert.deepEqual(splitIntoChunks(""), []);

// 2. Invalid configuration
assert.throws(() => splitIntoChunks("Hello", 0, 0));
assert.throws(() => splitIntoChunks("Hello", 100, 100));
assert.throws(() => splitIntoChunks("Hello", 100, -1));

// 3. Normal paragraph
const normal = splitIntoChunks(
  "Paragraph one.\n\nParagraph two.",
  100,
  20
);

assert.equal(normal.length, 1);

// 4. Overlap
const overlapText = `
Paragraph A contains useful information.

Paragraph B contains additional information.

Paragraph C contains more details.
`;

const overlapping = splitIntoChunks(overlapText, 110, 60);

assert.ok(overlapping.length > 1);
assert.ok(
  overlapping[0].includes("Paragraph B") &&
  overlapping[1].includes("Paragraph B")
);

// 5. Oversized paragraph
const longText = "A".repeat(250);
const longChunks = splitIntoChunks(longText, 100, 20);

assert.ok(longChunks.length > 1);
assert.ok(longChunks.every(chunk => chunk.length <= 100));

console.log("All chunking edge-case tests passed!");