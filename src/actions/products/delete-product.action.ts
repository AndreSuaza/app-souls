"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function deleteProductAction(id: string) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      throw new Error("No autorizado");
    }

    const product = await prisma.product.findUnique({
      where: { id },
      select: { code: true, status: true },
    });

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const deletedCode = `${product.code}-deleted-${id}`;

    await prisma.product.update({
      where: { id },
      data: {
        status: "deleted",
        show: false,
        // Libera el código para que pueda ser reutilizado en nuevos productos.
        code: deletedCode,
      },
    });

    await prisma.productImage.updateMany({
      where: { productId: id },
      data: { url: deletedCode },
    });
  } catch (error) {
    console.error("[deleteProductAction]", error);
    throw new Error(
      error instanceof Error ? error.message : "Error eliminando producto",
    );
  }
}
