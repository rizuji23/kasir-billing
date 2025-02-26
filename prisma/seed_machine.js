import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Insert a new machine record
  await prisma.machine.create({
    data: {
      id_machine: "MACHINE_001",
      status: "DISCONNECTED",
    },
  });

  console.log("✅ Seed Machine data inserted successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
