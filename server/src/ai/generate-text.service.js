import { groq } from "./groq.client.js";
import { AI_CONFIG } from "../config/ai.config.js";

export async function generateText({
  prompt,
  systemPrompt,
  model = AI_CONFIG.models.matterAssistant,
}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required");
  }

  if (!systemPrompt || typeof systemPrompt !== "string") {
    throw new Error("System prompt is required");
  }

  const response = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  const text = response.choices[0]?.message?.content;

  if (!text) {
    throw new Error(
      "AI provider returned an empty response",
    );
  }

  return {
    text,
    model,
  };
}

export async function* streamText({
  prompt,
  systemPrompt,
  model = AI_CONFIG.models.matterAssistant,
}) {
  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt is required");
  }

  if (!systemPrompt || typeof systemPrompt !== "string") {
    throw new Error("System prompt is required");
  }

  const stream = await groq.chat.completions.create({
    model,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    stream: true,
  });

  let hasContent = false;

  for await (const chunk of stream) {
    const content =
      chunk.choices?.[0]?.delta?.content;

    if (!content) {
      continue;
    }

    hasContent = true;

    yield content;
  }

  if (!hasContent) {
    throw new Error(
      "AI provider returned an empty streamed response",
    );
  }
}