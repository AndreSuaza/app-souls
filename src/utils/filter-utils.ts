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

import type { PaginationFilters } from "@/interfaces";

export interface FilterSelections {
  text: string;
  products: string[];
  types: string[];
  archetypes: string[];
  keywords: string[];
  rarities: string[];
  cost: string[];
  force: string[];
  defense: string[];
  limit: string[];
}

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
