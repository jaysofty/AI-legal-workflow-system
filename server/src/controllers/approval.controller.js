import { updateApproval } from "../services/approval.service.js";

export async function updateApprovalController(req, res, next) {
  try {
    const result = await updateApproval({
      approvalId: req.params.approvalId,
      userId: req.user.id,
      firmId: req.user.firmId,
      status: req.body.status,
      notes: req.body.notes,
    });

    return res.json({
      success: true,
      message:
        result.approval.status === "APPROVED"
          ? "Generated document approved successfully"
          : "Generated document rejected successfully",

      data: result,
    });
  } catch (error) {
    next(error);
  }
}
