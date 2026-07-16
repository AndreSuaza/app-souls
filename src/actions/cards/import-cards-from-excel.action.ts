"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CardExcelImportSchema } from "@/schemas";
import { resolveCardImageUrl } from "@/utils/card-image";
import { buildCardSlug } from "@/utils/card-slug";
import type { Prisma } from "@prisma/client";
import { read, utils } from "xlsx";

type ImportInvalidRow = {
  rowNumber: number;
  generatedCode: string | null;
  name: string | null;
  reasons: string[];
};

type ImportSummary = {
  rowsRead: number;
  validRows: number;
  invalidRows: number;
  insertedRows: number;
};

export type ImportCardsFromExcelResult = {
  status: "success" | "conflict";
  message: string;
  summary: ImportSummary;
  invalidRows: ImportInvalidRow[];
  conflictCodes: string[];
};

type ProductReference = {
  id: string;
  code: string;
  name: string;
};

type ParsedValidRow = {
  rowNumber: number;
  code: string;
  createData: Prisma.CardUncheckedCreateInput;
};

const HEADER_KEYS = {
  product: "producto",
  numeration: "numeracion",
  code: "codigo",
  cost: "coste",
  force: "fuerza",
  defense: "defensa",
  rarity: "rareza",
  name: "name",
  archetype: "arquetipo",
  price: "precios",
  type: "tipo",
  effect: "efecto",
  keyword: "keyword",
  rotation: "rotation",
} as const;

const REQUIRED_HEADERS = [
  HEADER_KEYS.product,
  HEADER_KEYS.numeration,
  HEADER_KEYS.code,
  HEADER_KEYS.cost,
  HEADER_KEYS.rarity,
  HEADER_KEYS.name,
  HEADER_KEYS.type,
  HEADER_KEYS.rotation,
] as const;

const normalizeLookupKey = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const toPlainString = (value: unknown) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    const asString = Number.isInteger(value) ? String(value) : String(value);
    return asString.trim();
  }
  if (typeof value === "string") return value.trim();
  return String(value).trim();
};

const splitList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseInteger = (value: unknown) => {
  const raw = toPlainString(value).replace(/\.0+$/, "");
  if (!raw) return null;
  if (!/^-?\d+$/.test(raw)) return null;
  const parsed = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const parseFloatNumber = (value: unknown) => {
  const raw = toPlainString(value).replace(",", ".");
  if (!raw) return null;
  const parsed = Number.parseFloat(raw);
  if (Number.isNaN(parsed)) return null;
  return parsed;
};

const normalizeNumeration = (value: unknown) => {
  const raw = toPlainString(value);
  if (!raw) return "";
  const compact = raw.replace(/\s+/g, "");
  if (/^\d+(\.0+)?$/.test(compact)) {
    const parsed = Number.parseInt(compact, 10);
    if (!Number.isNaN(parsed)) {
      return String(parsed).padStart(3, "0");
    }
  }
  return compact.toUpperCase();
};

const normalizeStat = (value: unknown) => {
  const raw = toPlainString(value);
  if (!raw) return "";
  const numeric = parseFloatNumber(raw);
  if (numeric === null) return raw;
  if (Number.isInteger(numeric)) return String(numeric);
  return String(numeric);
};

const buildSimpleLookup = (records: Array<{ id: string; name: string }>) => {
  const lookup = new Map<string, string>();

  records.forEach((record) => {
    if (record.id) {
      lookup.set(normalizeLookupKey(record.id), record.id);
    }
    const name = record.name?.trim();
    if (!name) return;
    lookup.set(normalizeLookupKey(name), record.id);
  });

  return lookup;
};

const buildProductLookup = (products: ProductReference[]) => {
  const lookup = new Map<string, ProductReference>();

  products.forEach((product) => {
    lookup.set(normalizeLookupKey(product.id), product);
    lookup.set(normalizeLookupKey(product.code), product);
    lookup.set(normalizeLookupKey(product.name), product);
  });

  return lookup;
};

const resolveIds = ({
  value,
  required,
  lookup,
  label,
}: {
  value: string;
  required: boolean;
  lookup: Map<string, string>;
  label: string;
}) => {
  const errors: string[] = [];
  const ids: string[] = [];
  const tokens = splitList(value);

  if (required && tokens.length === 0) {
    errors.push(`El campo ${label} es obligatorio.`);
    return { ids, errors };
  }

  tokens.forEach((token) => {
    const normalized = normalizeLookupKey(token);
    const id = lookup.get(normalized);
    if (!id) {
      errors.push(`${label} no encontrado: "${token}"`);
      return;
    }
    if (!ids.includes(id)) {
      ids.push(id);
    }
  });

  return { ids, errors };
};

const buildHeaderIndex = (headerRow: unknown[]) => {
  const map = new Map<string, number>();
  headerRow.forEach((rawHeader, idx) => {
    const header = normalizeLookupKey(toPlainString(rawHeader));
    if (!header) return;
    if (!map.has(header)) {
      map.set(header, idx);
    }
  });
  return map;
};

const findConflictingCodesInPayload = (codes: string[]) => {
  const map = new Map<string, number>();
  codes.forEach((code) => {
    map.set(code, (map.get(code) ?? 0) + 1);
  });
  return Array.from(map.entries())
    .filter(([, count]) => count > 1)
    .map(([code]) => code);
};

export async function importCardsFromExcelAction(
  formData: FormData,
): Promise<ImportCardsFromExcelResult> {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    throw new Error("No autorizado");
  }

  const parsedInput = CardExcelImportSchema.safeParse({
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    throw new Error(
      parsedInput.error.errors[0]?.message ?? "Archivo de entrada invalido.",
    );
  }

  const excelFile = parsedInput.data.file;
  const buffer = Buffer.from(await excelFile.arrayBuffer());
  const workbook = read(buffer, { type: "buffer", cellDates: false });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error("El archivo no contiene hojas para importar.");
  }

  const firstSheet = workbook.Sheets[firstSheetName];
  const matrixRows = utils.sheet_to_json<unknown[]>(firstSheet, {
    header: 1,
    defval: null,
    raw: true,
    blankrows: false,
  });

  if (matrixRows.length < 2) {
    throw new Error("El archivo no contiene filas de cartas para procesar.");
  }

  const headerIndex = buildHeaderIndex(matrixRows[0] ?? []);
  const missingHeaders = REQUIRED_HEADERS.filter(
    (header) => !headerIndex.has(header),
  );

  if (missingHeaders.length > 0) {
    throw new Error(
      `Faltan columnas obligatorias en el Excel: ${missingHeaders.join(", ")}`,
    );
  }

  const [types, archetypes, keywords, rarities, products] = await Promise.all([
    prisma.type.findMany({ select: { id: true, name: true } }),
    prisma.archetype.findMany({ select: { id: true, name: true } }),
    prisma.keyword.findMany({ select: { id: true, name: true } }),
    prisma.rarity.findMany({ select: { id: true, name: true } }),
    prisma.product.findMany({
      select: { id: true, code: true, name: true },
      where: {
        OR: [{ status: "active" }, { status: { isSet: false } }],
      },
    }),
  ]);

  const typeLookup = buildSimpleLookup(types);
  const archetypeLookup = buildSimpleLookup(archetypes);
  const keywordLookup = buildSimpleLookup(keywords);
  const rarityLookup = buildSimpleLookup(rarities);
  const productLookup = buildProductLookup(
    products.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
    })),
  );

  const validRows: ParsedValidRow[] = [];
  const invalidRows: ImportInvalidRow[] = [];
  let rowsRead = 0;

  const getCellValue = (row: unknown[], key: string) => {
    const idx = headerIndex.get(key);
    if (idx === undefined) return null;
    return row[idx] ?? null;
  };

  for (let idx = 1; idx < matrixRows.length; idx += 1) {
    const row = matrixRows[idx] ?? [];
    const rowNumber = idx + 1;

    const productRaw = toPlainString(getCellValue(row, HEADER_KEYS.product));
    const numerationRaw = normalizeNumeration(
      getCellValue(row, HEADER_KEYS.numeration),
    );
    const iddRaw = getCellValue(row, HEADER_KEYS.code);
    const costRaw = getCellValue(row, HEADER_KEYS.cost);
    const forceRaw = getCellValue(row, HEADER_KEYS.force);
    const defenseRaw = getCellValue(row, HEADER_KEYS.defense);
    const rarityRaw = toPlainString(getCellValue(row, HEADER_KEYS.rarity));
    const nameRaw = toPlainString(getCellValue(row, HEADER_KEYS.name));
    const archetypeRaw = toPlainString(
      getCellValue(row, HEADER_KEYS.archetype),
    );
    const priceRaw = getCellValue(row, HEADER_KEYS.price);
    const typeRaw = toPlainString(getCellValue(row, HEADER_KEYS.type));
    const effectRaw = toPlainString(getCellValue(row, HEADER_KEYS.effect));
    const keywordRaw = toPlainString(getCellValue(row, HEADER_KEYS.keyword));
    const rotationRaw = getCellValue(row, HEADER_KEYS.rotation);

    const isRowEmpty =
      !productRaw &&
      !numerationRaw &&
      !toPlainString(iddRaw) &&
      !nameRaw &&
      !typeRaw &&
      !rarityRaw;
    if (isRowEmpty) {
      continue;
    }

    rowsRead += 1;
    const reasons: string[] = [];

    if (!productRaw) reasons.push("El campo Producto es obligatorio.");
    if (!numerationRaw) reasons.push("El campo Numeracion es obligatorio.");
    if (!nameRaw) reasons.push("El campo Name es obligatorio.");
    if (!rarityRaw) reasons.push("El campo Rareza es obligatorio.");
    if (!typeRaw) reasons.push("El campo Tipo es obligatorio.");

    const iddParsed = parseInteger(iddRaw);
    if (iddParsed === null) {
      reasons.push("El campo Código (IDD) debe ser numérico.");
    }

    const costParsed = parseInteger(costRaw);
    if (costParsed === null) {
      reasons.push("El campo Coste debe ser numérico.");
    }

    const priceParsed =
      toPlainString(priceRaw) === "" ? null : parseFloatNumber(priceRaw);
    if (toPlainString(priceRaw) !== "" && priceParsed === null) {
      reasons.push("El campo Precios debe ser numérico.");
    }
    if (priceParsed !== null && priceParsed < 0) {
      reasons.push("El campo Precios no puede ser negativo.");
    }

    const isRotationEmpty = toPlainString(rotationRaw) === "";
    const rotationParsed = isRotationEmpty ? 0 : parseInteger(rotationRaw);
    if (!isRotationEmpty && rotationParsed === null) {
      reasons.push("El campo Rotation debe ser numérico entero.");
    }
    if (rotationParsed !== null && rotationParsed < 0) {
      reasons.push("El campo Rotation no puede ser negativo.");
    }

    const productReference = productLookup.get(normalizeLookupKey(productRaw));
    if (!productReference) {
      reasons.push(`Producto no encontrado: "${productRaw}"`);
    }

    const generatedCode =
      productReference && numerationRaw
        ? `${productReference.code}-${numerationRaw}`
        : productRaw && numerationRaw
          ? `${productRaw}-${numerationRaw}`
          : null;

    const typeResolved = resolveIds({
      value: typeRaw,
      required: true,
      lookup: typeLookup,
      label: "Tipo",
    });
    reasons.push(...typeResolved.errors);

    const rarityResolved = resolveIds({
      value: rarityRaw,
      required: true,
      lookup: rarityLookup,
      label: "Rareza",
    });
    reasons.push(...rarityResolved.errors);

    const archetypeResolved = resolveIds({
      value: archetypeRaw,
      required: false,
      lookup: archetypeLookup,
      label: "Arquetipo",
    });
    reasons.push(...archetypeResolved.errors);

    const keywordResolved = resolveIds({
      value: keywordRaw,
      required: false,
      lookup: keywordLookup,
      label: "Keyword",
    });
    reasons.push(...keywordResolved.errors);

    if (reasons.length > 0 || !productReference || !generatedCode) {
      invalidRows.push({
        rowNumber,
        generatedCode,
        name: nameRaw || null,
        reasons,
      });
      continue;
    }

    const createData: Prisma.CardUncheckedCreateInput = {
      idd: String(iddParsed),
      code: generatedCode,
      limit: "",
      rotation: rotationParsed ?? 0,
      cost: costParsed ?? 0,
      force: normalizeStat(forceRaw),
      defense: normalizeStat(defenseRaw),
      name: nameRaw,
      slug: buildCardSlug(nameRaw, generatedCode),
      effect: effectRaw || "",
      imageUrl: resolveCardImageUrl({
        code: generatedCode,
        idd: String(iddParsed),
      }),
      typeIds: typeResolved.ids,
      archetypesIds: archetypeResolved.ids,
      keywordsIds: keywordResolved.ids,
      raritiesIds: rarityResolved.ids,
      productId: productReference.id,
      price: priceParsed,
    };

    validRows.push({
      rowNumber,
      code: generatedCode,
      createData,
    });
  }

  const summaryBase = {
    rowsRead,
    validRows: validRows.length,
    invalidRows: invalidRows.length,
  };

  if (validRows.length === 0) {
    return {
      status: "success",
      message: "No se encontraron filas validas para insertar.",
      summary: {
        ...summaryBase,
        insertedRows: 0,
      },
      invalidRows,
      conflictCodes: [],
    };
  }

  const duplicateCodesInFile = findConflictingCodesInPayload(
    validRows.map((row) => row.code),
  );
  if (duplicateCodesInFile.length > 0) {
    return {
      status: "conflict",
      message:
        "Se detectaron codes repetidos dentro del archivo. Insercion detenida.",
      summary: {
        ...summaryBase,
        insertedRows: 0,
      },
      invalidRows,
      conflictCodes: duplicateCodesInFile,
    };
  }

  const existingCards = await prisma.card.findMany({
    where: {
      code: {
        in: validRows.map((row) => row.code),
      },
    },
    select: {
      code: true,
    },
  });

  const existingConflictCodes = existingCards.map((card) => card.code);
  if (existingConflictCodes.length > 0) {
    return {
      status: "conflict",
      message:
        "Se detectaron codes ya existentes en la base de datos. Insercion detenida.",
      summary: {
        ...summaryBase,
        insertedRows: 0,
      },
      invalidRows,
      conflictCodes: existingConflictCodes,
    };
  }

  await prisma.$transaction(
    validRows.map((row) => prisma.card.create({ data: row.createData })),
  );

  return {
    status: "success",
    message:
      invalidRows.length > 0
        ? "Importación completada con filas invalidas reportadas."
        : "Importación completada correctamente.",
    summary: {
      ...summaryBase,
      insertedRows: validRows.length,
    },
    invalidRows,
    conflictCodes: [],
  };
}
