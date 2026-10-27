import { DEFAULT_DASHBOARD_DAYS, type AdminDashboardFilters } from "@/schemas";

export type DashboardPeriod = {
  from: Date;
  to: Date;
  previousFrom: Date;
  previousTo: Date;
  days: number;
  fromKey: string;
  toKey: string;
};

export type DashboardChartType = "line" | "bar" | "area" | "donut";

export const dashboardChartComposition: Record<string, readonly DashboardChartType[]> = {
  general: ["line", "bar", "area", "donut"],
  tournaments: ["line", "donut", "bar", "line"],
  users: ["line", "donut", "bar", "bar"],
  simulator: ["line", "area", "bar", "bar"],
  pv: ["line", "bar", "bar", "bar"],
};

export const isDashboardChartCompositionValid = (dashboard: string) => {
  const types = dashboardChartComposition[dashboard] ?? [];
  return types.every((type, index) => types.indexOf(type) === index || types.filter((item) => item === type).length <= 2);
};

const startOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
};

const endOfDay = (date: Date) => {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
};

const toDateKey = (date: Date) => date.toISOString().slice(0, 10);

export const resolveDashboardPeriod = (
  filters: AdminDashboardFilters = {},
  now = new Date(),
): DashboardPeriod => {
  const fallbackDays = ["7", "30", "90"].includes(filters.preset ?? "")
    ? Number(filters.preset)
    : DEFAULT_DASHBOARD_DAYS;
  const to = filters.to ? endOfDay(new Date(`${filters.to}T00:00:00`)) : endOfDay(now);
  const from = filters.from
    ? startOfDay(new Date(`${filters.from}T00:00:00`))
    : startOfDay(new Date(to.getTime() - (fallbackDays - 1) * 86_400_000));
  const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - days * 86_400_000 + 1);

  return {
    from,
    to,
    previousFrom,
    previousTo,
    days,
    fromKey: toDateKey(from),
    toKey: toDateKey(to),
  };
};

export const buildDateSeries = (
  period: DashboardPeriod,
  values: Map<string, number>,
) => {
  const result: Array<{ date: string; label: string; value: number }> = [];
  const cursor = new Date(period.from);

  while (cursor <= period.to) {
    const date = toDateKey(cursor);
    result.push({
      date,
      label: new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short" }).format(cursor),
      value: values.get(date) ?? 0,
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return result;
};

export const addToDateMap = (map: Map<string, number>, date: Date, amount = 1) => {
  const key = toDateKey(date);
  map.set(key, (map.get(key) ?? 0) + amount);
};

export const percentageChange = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

export const serializeDate = (date: Date | null | undefined) =>
  date ? date.toISOString() : null;
