import pkg from "@prisma/client";
const { PrismaClient } = pkg;

function generateShortUUID() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let shortUUID = "";

  for (let i = 0; i < 10; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    shortUUID += chars[randomIndex];
  }

  return shortUUID;
}

const prisma = new PrismaClient();

async function main() {
  const billiardTable = [
    {
      id_table: generateShortUUID(),
      name: "Table 01",
      duration: "0",
      status: "AVAILABLE",
      number: "01",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 02",
      duration: "0",
      status: "AVAILABLE",
      number: "02",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 03",
      duration: "0",
      status: "AVAILABLE",
      number: "03",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 04",
      duration: "0",
      status: "AVAILABLE",
      number: "04",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 05",
      duration: "0",
      status: "AVAILABLE",
      number: "05",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 06",
      duration: "0",
      status: "AVAILABLE",
      number: "06",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 07",
      duration: "0",
      status: "AVAILABLE",
      number: "07",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 08",
      duration: "0",
      status: "AVAILABLE",
      number: "08",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 09",
      duration: "0",
      status: "AVAILABLE",
      number: "09",
    },
    {
      id_table: generateShortUUID(),
      name: "Table 10",
      duration: "0",
      status: "AVAILABLE",
      number: "10",
    },
  ];

  await prisma.tableBilliard.createMany({
    data: billiardTable,
  });

  console.log("✅ Seeded billiard tables successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
