import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

export function generateAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      firmId: user.firmId,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, JWT_SECRET);
}