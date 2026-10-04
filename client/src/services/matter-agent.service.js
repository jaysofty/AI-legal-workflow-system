import { api } from "./api.js";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function runMatterAgent({ matterId, question }) {
  if (!matterId) {
    throw new Error("A matter must be selected.");
  }

  if (!question?.trim()) {
    throw new Error("Please enter a message.");
  }

  const response = await api.post(`/matters/${matterId}/agent`, {
    question: question.trim(),
  });

  return response.data;
}

export async function streamMatterAgent({
  matterId,
  question,
  onEvent,
  signal,
}) {
  if (!matterId) {
    throw new Error("A matter must be selected.");
  }

  if (!question?.trim()) {
    throw new Error("Please enter a message.");
  }

  const token = localStorage.getItem("legalflow_token");

  const response = await fetch(`${API_URL}/matters/${matterId}/agent/stream`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
    },

    body: JSON.stringify({
      question: question.trim(),
    }),

    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);

    if (response.status === 401) {
      localStorage.removeItem("legalflow_token");
    }

    throw new Error(
      data?.message || "The Matter Agent could not complete the request.",
    );
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();

      if (done) {
        break;
      }

      buffer += decoder.decode(value, {
        stream: true,
      });

      const lines = buffer.split("\n");

      /*
       * The final element may only contain part of
       * the next JSON object. Keep it for the next
       * network chunk.
       */
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();

        if (!trimmedLine) {
          continue;
        }

        const event = parseStreamEvent(trimmedLine);

        if (event.type === "error") {
          throw new Error(event.message || "Matter Agent streaming failed.");
        }

        onEvent?.(event);
      }
    }

    /*
     * Flush anything still held by TextDecoder.
     */
    buffer += decoder.decode();

    const finalLine = buffer.trim();

    if (finalLine) {
      const event = parseStreamEvent(finalLine);

      if (event.type === "error") {
        throw new Error(event.message || "Matter Agent streaming failed.");
      }

      onEvent?.(event);
    }
  } finally {
    reader.releaseLock();
  }
}

function parseStreamEvent(line) {
  try {
    return JSON.parse(line);
  } catch {
    throw new Error("Received an invalid response from the Matter Agent.");
  }
}
