export type FilterNumericKey = "cost" | "force" | "defense";
export type FilterKey =
  | "products"
  | "types"
  | "archetypes"
  | "keywords"
  | "rarities"
  | "cost"
  | "force"
  | "defense"
  | "limit";

import type { PaginationFilters, FilterSelections } from "@/interfaces";

type SearchParamsReader = Pick<URLSearchParams, "get">;

const numberValues = Array.from({ length: 11 }).map((_, index) => `${index}`);
export const numberOptions = numberValues;

export function capitalizeWords(input: string): string {
  return input
    .split(" ")
    .map((word) =>
      word.length > 0 ? word[0].toUpperCase() + word.slice(1) : word
    )
    .join(" ");
}

export function buildFilterQuery(filters: FilterSelections): string {
  const encode = (value: string) => encodeURIComponent(value.trim());
  const joinValues = (values: string[]) =>
    values.map((value) => encode(value)).join(",");

  const parts: string[] = [];

  if (filters.text && filters.text.trim().length > 0) {
    parts.push(`text=${encode(capitalizeWords(filters.text))}`);
  }

  if (filters.products.length)
    parts.push(`products=${joinValues(filters.products)}`);
  if (filters.types.length) parts.push(`types=${joinValues(filters.types)}`);
  if (filters.archetypes.length)
    parts.push(`archetypes=${joinValues(filters.archetypes)}`);
  if (filters.keywords.length)
    parts.push(`keywords=${joinValues(filters.keywords)}`);
  if (filters.rarities.length)
    parts.push(`rarities=${joinValues(filters.rarities)}`);
  if (filters.cost.length) parts.push(`costs=${joinValues(filters.cost)}`);
  if (filters.force.length) parts.push(`forces=${joinValues(filters.force)}`);
  if (filters.defense.length)
    parts.push(`defenses=${joinValues(filters.defense)}`);
  if (filters.limit.length) parts.push(`limit=${joinValues(filters.limit)}`);

  return parts.join("&");
}

export function getDefaultFilters(): FilterSelections {
  return {
    text: "",
    products: [],
    types: [],
    archetypes: [],
    keywords: [],
    rarities: [],
    cost: [],
    force: [],
    defense: [],
    limit: [],
  };
}

const splitQueryValues = (value: string | null): string[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

export function parseFiltersFromSearchParams(
  searchParams: SearchParamsReader
): FilterSelections {
  return {
    text: searchParams.get("text")?.trim() ?? "",
    products: splitQueryValues(searchParams.get("products")),
    types: splitQueryValues(searchParams.get("types")),
    archetypes: splitQueryValues(searchParams.get("archetypes")),
    keywords: splitQueryValues(searchParams.get("keywords")),
    rarities: splitQueryValues(searchParams.get("rarities")),
    cost: splitQueryValues(searchParams.get("costs")),
    force: splitQueryValues(searchParams.get("forces")),
    defense: splitQueryValues(searchParams.get("defenses")),
    limit: splitQueryValues(searchParams.get("limit")),
  };
}

export function buildPaginationFilters(
  filters: FilterSelections
): PaginationFilters {
  const joinValues = (values: string[]) => values.join(",");
  const nextFilters: PaginationFilters = {};

  if (filters.text && filters.text.trim().length > 0) {
    nextFilters.text = capitalizeWords(filters.text);
  }

  if (filters.products.length)
    nextFilters.products = joinValues(filters.products);
  if (filters.types.length) nextFilters.types = joinValues(filters.types);
  if (filters.archetypes.length)
    nextFilters.archetypes = joinValues(filters.archetypes);
  if (filters.keywords.length)
    nextFilters.keywords = joinValues(filters.keywords);
  if (filters.rarities.length)
    nextFilters.rarities = joinValues(filters.rarities);
  if (filters.cost.length) nextFilters.costs = joinValues(filters.cost);
  if (filters.force.length) nextFilters.forces = joinValues(filters.force);
  if (filters.defense.length)
    nextFilters.defenses = joinValues(filters.defense);
  if (filters.limit.length) nextFilters.limit = joinValues(filters.limit);

  return nextFilters;
}
