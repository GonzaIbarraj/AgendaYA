import { prisma } from "../lib/db";
import bcrypt from "bcryptjs";

async function seed() {
  const email = "pepelopez@gmail.com";
  const passwordHash = await bcrypt.hash("ClaveValida123!", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      name: "Pepe López",
      isEmailConfirmed: true,
      failedLoginAttempts: 0,
      isBlocked: false,
      requiresCaptcha: false,
      publicSlug: "pepe-lopez",
    },
    create: {
      email,
      passwordHash,
      name: "Pepe López",
      timezone: "(UTC-03:00) Buenos Aires",
      isEmailConfirmed: true,
      failedLoginAttempts: 0,
      isBlocked: false,
      requiresCaptcha: false,
      publicSlug: "pepe-lopez",
    },
  });

  console.log("Usuario de prueba seed ejecutado con éxito para:", user.email);
}

seed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
