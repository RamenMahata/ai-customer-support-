export const splitIntoChunks = (
  text,
  chunkSize = 500,
  chunkOverlap = 100
) => {
  if (typeof text !== "string" || !text.trim()) {
    return [];
  }

  if (
    !Number.isInteger(chunkSize) ||
    !Number.isInteger(chunkOverlap) ||
    chunkSize <= 0 ||
    chunkOverlap < 0 ||
    chunkOverlap >= chunkSize
  ) {
    throw new Error("Invalid chunk size or overlap");
  }

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const chunks = [];
  let currentChunk = [];

  const getLength = (items) => items.join("\n\n").length;

  for (const paragraph of paragraphs) {
    // Handle paragraphs larger than the maximum chunk size.
    if (paragraph.length > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push(currentChunk.join("\n\n"));
        currentChunk = [];
      }

      const step = chunkSize - chunkOverlap;

      for (let i = 0; i < paragraph.length; i += step) {
        const part = paragraph.slice(i, i + chunkSize).trim();

        if (part) {
          chunks.push(part);
        }
      }

      continue;
    }

    const candidate = [...currentChunk, paragraph];

    if (getLength(candidate) <= chunkSize) {
      currentChunk = candidate;
      continue;
    }

    // Save the current chunk.
    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join("\n\n"));
    }

    // Retain trailing paragraphs that fit within the overlap budget.
    const overlap = [];
    let overlapLength = 0;

    for (let i = currentChunk.length - 1; i >= 0; i--) {
      const item = currentChunk[i];
      const nextLength = overlapLength === 0
        ? item.length
        : overlapLength + 2 + item.length;

      if (nextLength > chunkOverlap) {
        break;
      }

      overlap.unshift(item);
      overlapLength = nextLength;
    }

    currentChunk = [...overlap, paragraph];
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join("\n\n"));
  }

  return chunks;
};