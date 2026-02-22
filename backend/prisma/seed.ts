import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Seed plans
  const plans = [
    {
      id: "free",
      name: "Free",
      priceMonthly: 0,
      monthlyQuota: 100,
      requestsPerMin: 5,
      dailyLimit: 100,
      overagePrice: 0,
      stripePriceId: null,
    },
    {
      id: "starter",
      name: "Starter",
      priceMonthly: 2900,
      monthlyQuota: 1000,
      requestsPerMin: 20,
      dailyLimit: 1000,
      overagePrice: 5,
      stripePriceId: process.env.STRIPE_STARTER_PRICE_ID || null,
    },
    {
      id: "growth",
      name: "Growth",
      priceMonthly: 9900,
      monthlyQuota: 10000,
      requestsPerMin: 60,
      dailyLimit: 10000,
      overagePrice: 3,
      stripePriceId: process.env.STRIPE_GROWTH_PRICE_ID || null,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan,
    });
    console.log(`  Created/updated plan: ${plan.name}`);
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
