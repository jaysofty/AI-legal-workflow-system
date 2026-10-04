import bcrypt from "bcryptjs";
import { prisma } from "./src/config/database.js";

const email = "admin@legalflow.test";
const newPassword = "LegalFlow@2026!";

async function resetPassword() {
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      passwordHash,
    },
    select: {
      id: true,
      email: true,
    },
  });

  console.log("Development password reset successfully.");
  console.log(`Email: ${user.email}`);
  console.log(`Password: ${newPassword}`);
}

resetPassword()
  .catch((error) => {
    console.error("Failed to reset password:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });