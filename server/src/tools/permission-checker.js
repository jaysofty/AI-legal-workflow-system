import { TOOL_PERMISSION } from "./permissions.js";

export function checkToolPermission({
  toolName,
  user,
}) {
  const permission = TOOL_PERMISSION[toolName];

  if (!permission) {
    const error = new Error(
      `No permission policy configured for tool: ${toolName}`,
    );

    error.statusCode = 403;

    throw error;
  }

  if (!permission.allowedRoles.includes(user.role)) {
    const error = new Error(
      `Role ${user.role} is not permitted to use tool: ${toolName}`,
    );

    error.statusCode = 403;

    throw error;
  }

  return permission;
}