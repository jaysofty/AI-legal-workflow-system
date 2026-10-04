import {
  uploadDocument,
  createDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  archiveDocument,
} from "../services/document.service.js";

export async function createDocumentController(req, res, next) {
  try {
    const document = await createDocument(
      req.user.firmId,
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Document created successfully",
      data: { document },
    });
  } catch (error) {
    if (
      error.message ===
      "Matter not found or does not belong to this firm"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function getDocumentsController(req, res, next) {
  try {
    const documents = await getDocuments(
      req.user.firmId,
      {
        matterId: req.query.matterId,
        type: req.query.type,
        status: req.query.status,
      }
    );

    return res.json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDocumentController(req, res, next) {
  try {
    const document = await getDocumentById(
      req.user.firmId,
      req.params.id
    );

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.json({
      success: true,
      data: { document },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateDocumentController(req, res, next) {
  try {
    const document = await updateDocument(
      req.user.firmId,
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      message: "Document updated successfully",
      data: { document },
    });
  } catch (error) {
    if (error.message === "Document not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function archiveDocumentController(req, res, next) {
  try {
    const document = await archiveDocument(
      req.user.firmId,
      req.params.id
    );

    return res.json({
      success: true,
      message: "Document archived successfully",
      data: { document },
    });
  } catch (error) {
    if (error.message === "Document not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function uploadDocumentController(
  req,
  res,
  next
) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Document file is required",
      });
    }

    const result = await uploadDocument(
      req.user.firmId,
      req.user.id,
      req.body,
      req.file
    );

    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully",
      data: result,
    });
  } catch (error) {
    if (
      error.message ===
      "Matter not found or does not belong to this firm"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
      "No readable text could be extracted from this document"
    ) {
      return res.status(422).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}