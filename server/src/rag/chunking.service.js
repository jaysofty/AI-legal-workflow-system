import { prisma } from "../config/database.js";

const DEFAULT_CHUNK_SIZE = 1200;
const DEFAULT_CHUNK_OVERLAP = 200;

export function normalizeText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function splitIntoParagraphs(text) {
  return normalizeText(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function createTextChunks(
  text,
  {
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
  } = {},
) {
  if (!text || typeof text !== "string") {
    return [];
  }

  if (chunkSize <= 0) {
    throw new Error("chunkSize must be greater than 0");
  }

  if (chunkOverlap < 0) {
    throw new Error("chunkOverlap cannot be negative");
  }

  if (chunkOverlap >= chunkSize) {
    throw new Error(
      "chunkOverlap must be smaller than chunkSize",
    );
  }

  const paragraphs = splitIntoParagraphs(text);

  const chunks = [];
  let currentChunk = "";

  for (const paragraph of paragraphs) {
    const candidate = currentChunk
      ? `${currentChunk}\n\n${paragraph}`
      : paragraph;

    if (candidate.length <= chunkSize) {
      currentChunk = candidate;
      continue;
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    if (paragraph.length <= chunkSize) {
      const overlap = getOverlapText(
        currentChunk,
        chunkOverlap,
      );

      currentChunk = overlap
        ? `${overlap}\n\n${paragraph}`
        : paragraph;

      if (currentChunk.length > chunkSize) {
        chunks.push(currentChunk);
        currentChunk = "";
      }

      continue;
    }

    const paragraphChunks = splitLongParagraph(
      paragraph,
      chunkSize,
      chunkOverlap,
    );

    chunks.push(...paragraphChunks.slice(0, -1));

    currentChunk =
      paragraphChunks[paragraphChunks.length - 1] || "";
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks.map((content, index) => ({
    chunkIndex: index,
    content,
    characterCount: content.length,
  }));
}

function getOverlapText(text, overlapSize) {
  if (!text || overlapSize === 0) {
    return "";
  }

  if (text.length <= overlapSize) {
    return text;
  }

  const start = text.length - overlapSize;

  const nextSpace = text.indexOf(" ", start);

  if (nextSpace !== -1) {
    return text.slice(nextSpace + 1).trim();
  }

  return text.slice(start).trim();
}

function splitLongParagraph(
  paragraph,
  chunkSize,
  chunkOverlap,
) {
  const chunks = [];

  let start = 0;

  while (start < paragraph.length) {
    let end = Math.min(
      start + chunkSize,
      paragraph.length,
    );

    // If we haven't reached the end, move the
    // boundary backwards to the nearest whitespace.
    if (end < paragraph.length) {
      const boundary = paragraph.lastIndexOf(
        " ",
        end,
      );

      if (boundary > start) {
        end = boundary;
      }
    }

    const chunk = paragraph
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
    }

    if (end >= paragraph.length) {
      break;
    }

    /*
     * Start the next chunk before the end of the
     * current chunk so we retain context.
     */
    let nextStart = Math.max(
      end - chunkOverlap,
      start + 1,
    );

    /*
     * Move the overlap boundary backwards to the
     * beginning of a word.
     */
    const previousSpace = paragraph.lastIndexOf(
      " ",
      nextStart,
    );

    if (previousSpace > start) {
      nextStart = previousSpace + 1;
    }

    start = nextStart;
  }

  return chunks;
}

export async function createDocumentChunks(
  documentId,
  firmId,
  {
    chunkSize = DEFAULT_CHUNK_SIZE,
    chunkOverlap = DEFAULT_CHUNK_OVERLAP,
  } = {},
) {
  const document = await prisma.document.findFirst({
    where: {
      id: documentId,
      firmId,
    },
    select: {
      id: true,
      extractedText: true,
      status: true,
    },
  });

  if (!document) {
    throw new Error(
      "Document not found or does not belong to this firm",
    );
  }

  if (!document.extractedText) {
    throw new Error(
      "Document does not contain extracted text",
    );
  }

  const chunks = createTextChunks(document.extractedText, {
    chunkSize,
    chunkOverlap,
  });

  if (chunks.length === 0) {
    throw new Error(
      "No chunks could be created from the document",
    );
  }

  await prisma.documentChunk.deleteMany({
    where: {
      documentId,
    },
  });

  await prisma.documentChunk.createMany({
    data: chunks.map((chunk) => ({
      documentId,
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      metadata: {
        characterCount: chunk.characterCount,
        chunkSize,
        chunkOverlap,
      },
    })),
  });

  return prisma.documentChunk.findMany({
    where: {
      documentId,
    },
    orderBy: {
      chunkIndex: "asc",
    },
    select: {
      id: true,
      documentId: true,
      content: true,
      chunkIndex: true,
      pageNumber: true,
      metadata: true,
      createdAt: true,
    },
  });
}