export const buildEventSlug = (value: string) => {
  if (!value) return "";
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");
};

export const EVENT_SLUG_MAX_LENGTH = 180;

export const buildEventSlugDatePart = (value: string | Date) => {
  if (typeof value === "string") {
    const dateMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      return `${day}-${month}-${year}`;
    }
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day}-${month}-${year}`;
};

export const buildEventCompositeSlug = ({
  title,
  storeName,
  startsAt,
}: {
  title: string;
  storeName?: string | null;
  startsAt: string | Date;
}) =>
  buildEventSlug(
    [title, storeName?.trim() || "sin tienda", buildEventSlugDatePart(startsAt)]
      .filter(Boolean)
      .join(" "),
  )
    .slice(0, EVENT_SLUG_MAX_LENGTH)
    .replace(/-+$/g, "");
