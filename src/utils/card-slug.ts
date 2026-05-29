export const normalizeCardSlug = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

export const buildCardSlug = (name: string, code: string) => {
  const base = `${name ?? ""} ${code ?? ""}`.trim();
  if (!base) return "";

  return normalizeCardSlug(base);
};
