import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from "../services/task.service.js";

export async function createTaskController(
  req,
  res,
  next
) {
  try {
    const task = await createTask(
      req.user.firmId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    if (
      error.message ===
        "Matter not found or does not belong to this firm" ||
      error.message ===
        "Assigned user not found or does not belong to this firm"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function getTasksController(
  req,
  res,
  next
) {
  try {
    const tasks = await getTasks(
      req.user.firmId,
      {
        matterId: req.query.matterId,
        assignedToId: req.query.assignedToId,
        status: req.query.status,
        priority: req.query.priority,
      }
    );

    return res.json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskController(
  req,
  res,
  next
) {
  try {
    const task = await getTaskById(
      req.user.firmId,
      req.params.id
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    return res.json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskController(
  req,
  res,
  next
) {
  try {
    const task = await updateTask(
      req.user.firmId,
      req.params.id,
      req.body
    );

    return res.json({
      success: true,
      message: "Task updated successfully",
      data: {
        task,
      },
    });
  } catch (error) {
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message ===
        "Matter not found or does not belong to this firm" ||
      error.message ===
        "Assigned user not found or does not belong to this firm"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}

export async function deleteTaskController(
  req,
  res,
  next
) {
  try {
    await deleteTask(
      req.user.firmId,
      req.params.id
    );

    return res.json({
      success: true,
      message: "Task deleted successfully",
    });
  } catch (error) {
    if (error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
}