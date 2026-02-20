"use server";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ProductSearchSchema, type ProductSearchInput } from "@/schemas";

export async function searchProductsAction(input: ProductSearchInput = {}) {
  const { text, take = 24, page = 1 } = ProductSearchSchema.parse(input);
  const currentPage = Math.max(1, page);
  const searchText = text?.trim();

  const where: Prisma.ProductWhereInput = {
    show: true,
    ...(searchText
      ? {
          OR: [
            {
              name: {
                contains: searchText,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
            {
              code: {
                contains: searchText,
                mode: "insensitive" as Prisma.QueryMode,
              },
            },
          ],
        }
      : {}),
  };

  const totalCount = await prisma.product.count({ where });
  const totalPages = Math.max(1, Math.ceil(totalCount / take));
  const safePage = Math.min(currentPage, totalPages);

  const products = await prisma.product.findMany({
    where,
    take,
    skip: (safePage - 1) * take,
    orderBy: {
      createDate: "desc",
    },
    select: {
      id: true,
      name: true,
      ProductImage: {
        select: {
          url: true,
        },
        take: 1,
      },
    },
  });

  return {
    products: products.map((product) => ({
      id: product.id,
      name: product.name,
      imageUrl: product.ProductImage[0]?.url ?? null,
    })),
    totalCount,
    totalPages,
    currentPage: safePage,
    perPage: take,
  };
}
