const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.car.findMany({
    where: {
      make: { contains: "Audi", mode: "insensitive" },
      model: { contains: "Q7", mode: "insensitive" }
    }
  });
  console.log(JSON.stringify(cars, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
