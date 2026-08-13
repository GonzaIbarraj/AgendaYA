/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

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

  console.log("SUCCESS: Usuario de prueba creado/actualizado con exito:", user.email);
}

seed()
  .catch((e) => {
    console.error("ERROR:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
