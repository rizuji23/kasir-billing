import pkg from "@prisma/client";
const { PrismaClient } = pkg;
import crypto from "crypto";

const prisma = new PrismaClient();

function generateShortUUID() {
  return crypto.randomUUID().replace(/-/g, "").substring(0, 10); // Shorten UUID
}

async function main() {
  // Seed PriceBillingType table first
  const [regularType, vipType] = await Promise.all([
    prisma.priceBillingType.upsert({
      where: { type_price: "REGULAR" },
      update: {},
      create: {
        id_price_billing_type: generateShortUUID(),
        type_price: "REGULAR",
      },
    }),
    prisma.priceBillingType.upsert({
      where: { type_price: "VIP" },
      update: {},
      create: {
        id_price_billing_type: generateShortUUID(),
        type_price: "VIP",
      },
    }),
  ]);

  // Seed PriceBilling table using createMany
  await prisma.priceBilling.createMany({
    data: [
      {
        id_price_billing: generateShortUUID(),
        type_price_id: regularType.id,
        season: "Pagi",
        price: 50000,
      },
      {
        id_price_billing: generateShortUUID(),
        type_price_id: regularType.id,
        season: "Malam",
        price: 70000,
      },
      {
        id_price_billing: generateShortUUID(),
        type_price_id: vipType.id,
        season: "Pagi",
        price: 80000,
      },
      {
        id_price_billing: generateShortUUID(),
        type_price_id: vipType.id,
        season: "Malam",
        price: 100000,
      },
    ],
  });

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
