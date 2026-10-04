import { prisma } from "../config/database.js";
import fs from "fs/promises";
import path from "path";
import { extractDocumentText } from "./document-extraction.service.js";
import { uploadedDocumentMetadataSchema } from "../validation/document.validation.js";

export async function createDocument(firmId, userId, data) {
  if (data.matterId) {
    const matter = await prisma.matter.findFirst({
      where: {
        id: data.matterId,
        firmId,
      },
      select: {
        id: true,
      },
    });

    if (!matter) {
      throw new Error("Matter not found or does not belong to this firm");
    }
  }

  return prisma.document.create({
    data: {
      firmId,
      matterId: data.matterId,
      name: data.name,
      type: data.type,
      status: data.status || "UPLOADED",
      fileUrl: data.fileUrl,
      mimeType: data.mimeType,
      fileSize: data.fileSize,
      extractedText: data.extractedText,
      uploadedById: userId,
    },
    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          status: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          chunks: true,
          generatedDocuments: true,
        },
      },
    },
  });
}

export async function getDocuments(firmId, filters = {}) {
  const where = {
    firmId,
  };

  if (filters.matterId) {
    where.matterId = filters.matterId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return prisma.document.findMany({
    where,
    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          status: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          chunks: true,
          generatedDocuments: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function getDocumentById(firmId, documentId) {
  return prisma.document.findFirst({
    where: {
      id: documentId,
      firmId,
    },
    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          description: true,
          type: true,
          status: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      chunks: {
        select: {
          id: true,
          chunkIndex: true,
          pageNumber: true,
          content: true,
          metadata: true,
          createdAt: true,
        },
        orderBy: {
          chunkIndex: "asc",
        },
      },
      _count: {
        select: {
          chunks: true,
          generatedDocuments: true,
        },
      },
    },
  });
}

export async function updateDocument(firmId, documentId, data) {
  const existingDocument = await prisma.document.findFirst({
    where: {
      id: documentId,
      firmId,
    },
    select: {
      id: true,
    },
  });

  if (!existingDocument) {
    throw new Error("Document not found");
  }

  return prisma.document.update({
    where: {
      id: documentId,
    },
    data,
    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          status: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
      _count: {
        select: {
          chunks: true,
          generatedDocuments: true,
        },
      },
    },
  });
}

export async function archiveDocument(firmId, documentId) {
  const existingDocument = await prisma.document.findFirst({
    where: {
      id: documentId,
      firmId,
    },
    select: {
      id: true,
    },
  });

  if (!existingDocument) {
    throw new Error("Document not found");
  }

  return prisma.document.update({
    where: {
      id: documentId,
    },
    data: {
      status: "ARCHIVED",
    },
    include: {
      matter: {
        select: {
          id: true,
          referenceNumber: true,
          title: true,
          status: true,
        },
      },
    },
  });
}

export async function uploadDocument(firmId, userId, data, file) {
  const metadataResult = uploadedDocumentMetadataSchema.safeParse(data);

  if (!metadataResult.success) {
    await fs.unlink(file.path).catch(() => {});

    const error = new Error("Document upload validation failed");

    error.statusCode = 400;
    error.validationErrors = metadataResult.error.flatten();

    throw error;
  }

  data = metadataResult.data;

  if (!file) {
    throw new Error("Document file is required");
  }

  const matter = await prisma.matter.findFirst({
    where: {
      id: data.matterId,
      firmId,
    },
    select: {
      id: true,
      referenceNumber: true,
      title: true,
    },
  });

  if (!matter) {
    await fs.unlink(file.path).catch(() => {});

    throw new Error("Matter not found or does not belong to this firm");
  }

  const relativeFilePath = path
    .relative(process.cwd(), file.path)
    .replace(/\\/g, "/");

  let document;

  try {
    document = await prisma.document.create({
      data: {
        firmId,
        matterId: data.matterId,
        name: data.name,
        type: data.type,
        status: "PROCESSING",
        fileUrl: `/${relativeFilePath}`,
        mimeType: file.mimetype,
        fileSize: file.size,
        uploadedById: userId,
      },
    });

    const extraction = await extractDocumentText(file.path, file.mimetype);

    const extractedText = extraction.text;

    if (!extractedText) {
      throw new Error("No readable text could be extracted from this document");
    }

    document = await prisma.document.update({
      where: {
        id: document.id,
      },
      data: {
        extractedText,
        status: "READY",
      },
      include: {
        matter: {
          select: {
            id: true,
            referenceNumber: true,
            title: true,
            status: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        _count: {
          select: {
            chunks: true,
            generatedDocuments: true,
          },
        },
      },
    });

    return {
      document,
      extraction: {
        characterCount: extractedText.length,
        pageCount: extraction.pageCount,
        warnings: extraction.warnings || [],
      },
    };
  } catch (error) {
    if (document?.id) {
      await prisma.document
        .update({
          where: {
            id: document.id,
          },
          data: {
            status: "FAILED",
          },
        })
        .catch(() => {});
    }

    throw error;
  }
}
