export const EMBEDDING_CONFIG = {
  provider: "huggingface",

  model: "Xenova/all-MiniLM-L6-v2",

  dimensions: 384,

  chunking: {
    size: 1200,
    overlap: 200,
  },
};