import {
  createClient,
  getClients,
  getClientById,
  updateClient,
} from "../services/client.service.js";

export async function createClientController(req, res, next) {
  try {
    const client = await createClient(
      req.user.firmId,
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      data: {
        client,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getClientsController(req, res, next) {
  try {
    const clients = await getClients(req.user.firmId);

    return res.json({
      success: true,
      data: {
        clients,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getClientController(req, res, next) {
  try {
    const client = await getClientById(
      req.user.firmId,
      req.params.id
    );

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    return res.json({
      success: true,
      data: {
        client,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateClientController(req, res, next) {
  try {
    const client = await updateClient(
      req.user.firmId,
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      data: {
        client,
      },
    });
  } catch (error) {
    if (error.message === "Client not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}