import { prisma } from "../lib/prisma";

async function main() {
  const withComma = await prisma.card.findMany({
    where: { code: { contains: "," } },
    select: { idd: true, code: true },
  });

  console.log("Codes con coma:", withComma.length);
  withComma.slice(0, 20).forEach((card) => {
    console.log(`- ${card.idd} | ${card.code}`);
  });
}

(() => {
  const run = async () => {
    try {
      await main();
    } catch (error) {
      console.error("[check-card-codes]", error);
    } finally {
      await prisma.$disconnect();
    }
  };

  void run();
})();
