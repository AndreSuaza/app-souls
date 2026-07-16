import type { Prisma } from "@prisma/client";

export const activeCardWhere = (): Prisma.CardWhereInput => ({
  OR: [{ status: "active" }, { status: { isSet: false } }],
});

export const withActiveCardWhere = (
  where: Prisma.CardWhereInput = {},
): Prisma.CardWhereInput => ({
  AND: [activeCardWhere(), where],
});
