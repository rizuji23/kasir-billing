import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const memberPrice = [
    {
      price: 60000,
      discount: 3.5,
      playing: 10,
      type_member: "PREMIUM",
    },
    {
      price: 80000,
      discount: 5,
      playing: 20,
      type_member: "GOLD",
    },
    {
      price: 100000,
      discount: 10,
      playing: 30,
      type_member: "PLATINUM",
    },
  ];

  await prisma.priceMember.createMany({
    data: memberPrice,
  });

  console.log("✅ Seeded member price successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
