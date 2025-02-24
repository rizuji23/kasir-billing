import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.shift.createMany({
    data: [
      {
        shift: "Pagi", // Morning Shift
        start_hours: new Date(new Date().setHours(8, 0, 0, 0)), // 08:00:00 AM
        end_hours: new Date(new Date().setHours(17, 0, 0, 0)), // 05:00:00 PM
      },
      {
        shift: "Malam", // Night Shift
        start_hours: new Date(new Date().setHours(17, 0, 0, 0)), // 05:00:00 PM
        end_hours: new Date(new Date().setHours(8, 0, 0, 0) + 86400000), // 08:00:00 AM (next day)
      },
    ],
  });

  console.log("✅ Shifts seeded successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding shifts:", e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
