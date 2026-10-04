import "dotenv/config";

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  throw new Error("GROQ_API_KEY is missing");
}

export const AI_CONFIG = {
  provider: "groq",

  models: {
    matterAssistant: "openai/gpt-oss-120b",
    documentAssistant: "openai/gpt-oss-120b",
    legalResearch: "openai/gpt-oss-120b",
    intake: "openai/gpt-oss-120b",
  },

  agent: {
    maxIterations: 10,
  },
};