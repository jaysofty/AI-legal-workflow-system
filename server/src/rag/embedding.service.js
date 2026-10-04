import { pipeline } from "@huggingface/transformers";

import { EMBEDDING_CONFIG } from "../config/embedding.config.js";

let embeddingPipeline = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline(
      "feature-extraction",
      EMBEDDING_CONFIG.model,
    );
  }

  return embeddingPipeline;
}

export async function embedText(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Text is required for embedding");
  }

  const cleanedText = text.trim();

  if (!cleanedText) {
    throw new Error("Text cannot be empty");
  }

  const extractor = await getEmbeddingPipeline();

  const output = await extractor(cleanedText, {
    pooling: "mean",
    normalize: true,
  });

  const embedding = Array.from(output.data);

  if (embedding.length !== EMBEDDING_CONFIG.dimensions) {
    throw new Error(
      `Embedding dimension mismatch. Expected ${EMBEDDING_CONFIG.dimensions}, received ${embedding.length}`,
    );
  }

  return embedding;
}

export async function embedTexts(texts) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error("Texts must be a non-empty array");
  }

  const embeddings = [];

  for (const text of texts) {
    embeddings.push(await embedText(text));
  }

  return embeddings;
}