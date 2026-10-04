import fs from "fs/promises";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

export async function extractDocumentText(filePath, mimeType) {
  const buffer = await fs.readFile(filePath);

  if (mimeType === "application/pdf") {
    const parser = new PDFParse({
      data: buffer,
    });

    const data = await parser.getText();

    await parser.destroy();

    return {
      text: cleanExtractedText(data.text),
      pageCount: data.total,
    };
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({
      buffer,
    });

    return {
      text: cleanExtractedText(result.value),
      pageCount: null,
      warnings: result.messages || [],
    };
  }

  throw new Error("Unsupported document type for text extraction");
}

function cleanExtractedText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}