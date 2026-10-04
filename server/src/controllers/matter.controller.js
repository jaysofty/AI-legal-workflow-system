import {
  createMatter,
  getMatters,
  getMatterById,
  updateMatter,
} from "../services/matter.service.js";

export async function createMatterController(
  req,
  res,
  next
) {
  try {
    const matter = await createMatter(
      req.user.firmId,
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Matter created successfully",
      data: {
        matter,
      },
    });
  } catch (error) {
    if (
      error.message ===
        "Client not found or does not belong to this firm" ||
      error.message ===
        "A matter with this reference number already exists"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function getMattersController(
  req,
  res,
  next
) {
  try {
    const matters = await getMatters(
      req.user.firmId
    );

    return res.json({
      success: true,
      data: {
        matters,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMatterController(
  req,
  res,
  next
) {
  try {
    const matter = await getMatterById(
      req.user.firmId,
      req.params.id
    );

    if (!matter) {
      return res.status(404).json({
        success: false,
        message: "Matter not found",
      });
    }

    return res.json({
      success: true,
      data: {
        matter,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateMatterController(
  req,
  res,
  next
) {
  try {
    const matter = await updateMatter(
      req.user.firmId,
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      message: "Matter updated successfully",
      data: {
        matter,
      },
    });
  } catch (error) {
    if (
      error.message === "Matter not found"
    ) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
        "Client not found or does not belong to this firm" ||
      error.message ===
        "A matter with this reference number already exists"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}