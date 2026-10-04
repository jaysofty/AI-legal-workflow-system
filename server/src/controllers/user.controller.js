import { getFirmUsers } from "../services/user.service.js";

export async function getFirmUsersController(req, res, next) {
  try {
    const users = await getFirmUsers(req.user.firmId);

    return res.json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
}