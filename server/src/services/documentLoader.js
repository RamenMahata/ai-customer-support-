import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const KNOWLEDGE_BASE_PATH = path.resolve(
  __dirname,
  "../knowledge-base"
);

export const loadDocuments = async () => {
  const files = await fs.readdir(KNOWLEDGE_BASE_PATH);

  const markdownFiles = files.filter((file) =>
    file.endsWith(".md")
  );

  const documents = await Promise.all(
    markdownFiles.map(async (file) => {
      const filePath = path.join(KNOWLEDGE_BASE_PATH, file);

      const content = await fs.readFile(filePath, "utf-8");

      return {
        id: file,
        source: file,
        content: content.trim(),
      };
    })
  );

  return documents;
};