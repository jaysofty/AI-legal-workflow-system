import { askMatterAssistant } from "../ai/matter-assistant.service.js";

export async function askMatterAssistantController(
  req,
  res,
  next,
) {
  try {
    const { matterId } = req.params;

    const result = await askMatterAssistant({
      question: req.body.question,
      userId: req.user.id,
      firmId: req.user.firmId,
      matterId,
      documentId: req.body.documentId,
      limit: req.body.limit,
    });

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}