import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("superadmin123", 12);

  await prisma.user.upsert({
    where: { email: "superadmin@admin.com" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@admin.com",
      password: hashedPassword,
      role: "SUPERADMIN",
    },
  });

  console.log("✅ Seed berhasil! Akun superadmin dibuat.");
  console.log("   Email   : superadmin@admin.com");
  console.log("   Password: superadmin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
