import { prisma } from "../lib/prisma";
import { buildStoreSlug } from "../utils/store-slug";

async function main() {
  // Prisma no puede leer slugs nulos, por eso usamos un comando raw directo.
  const rawResult = (await prisma.$runCommandRaw({
    find: "Store",
    filter: {},
    projection: { _id: 1, name: 1, slug: 1 },
  })) as {
    cursor?: { firstBatch?: Array<{ _id: unknown; name?: string; slug?: string }> };
  };

  const stores = rawResult.cursor?.firstBatch ?? [];
  const getObjectId = (value: unknown) => {
    if (!value || typeof value !== "object") return "";
    const maybeOid = value as {
      $oid?: string;
      toHexString?: () => string;
      toString?: () => string;
    };

    if (typeof maybeOid.$oid === "string") return maybeOid.$oid;
    if (typeof maybeOid.toHexString === "function") return maybeOid.toHexString();
    if (typeof maybeOid.toString === "function") {
      const result = maybeOid.toString();
      if (result && result !== "[object Object]") return result;
    }

    return "";
  };

  const usedSlugs = new Set<string>();
  let processed = 0;

  for (const store of stores) {
    const existingSlug =
      typeof store.slug === "string" ? store.slug.trim() : "";

    if (existingSlug) {
      usedSlugs.add(existingSlug);
      continue;
    }

    const id = getObjectId(store._id);
    const baseSlug =
      buildStoreSlug(store.name ?? "") || `tienda-${id || processed + 1}`;
    let nextSlug = baseSlug;
    let counter = 2;

    // Evita colisiones si hay tiendas con el mismo nombre.
    while (usedSlugs.has(nextSlug)) {
      nextSlug = `${baseSlug}-${counter}`;
      counter += 1;
    }

    if (!id) {
      console.warn(
        `[seed-store-slugs] Store sin _id válido, no se actualiza: ${store.name ?? "sin nombre"}`,
      );
      continue;
    }

    await prisma.$runCommandRaw({
      update: "Store",
      updates: [
        {
          q: { _id: { $oid: id } },
          u: { $set: { slug: nextSlug } },
          upsert: false,
          multi: false,
        },
      ],
    });

    usedSlugs.add(nextSlug);
    processed += 1;

    if (processed % 100 === 0) {
      console.log(`Slugs actualizados: ${processed}`);
    }
  }

  console.log(`Proceso finalizado. Total: ${processed}`);
}

(async () => {
  try {
    await main();
  } catch (error) {
    console.error("[seed-store-slugs]", error);
  } finally {
    await prisma.$disconnect();
  }
})();
