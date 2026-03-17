export const buildCardSlug = (name: string, code: string) => {
  const base = `${name ?? ""} ${code ?? ""}`.trim();
  if (!base) return "";

  return base
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
};
