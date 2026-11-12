"use client";

import { useId } from "react";
import { useReducedMotion, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date?: string; label: string; value: number; [key: string]: string | number | undefined };
type Breakdown = { name: string; value: number; color?: string };

const formatHoursEquivalent = (minutes: number) =>
  `${(minutes / 60).toLocaleString("es-CO", { maximumFractionDigits: 2 })} h`;

const axisColor = "var(--admin-chart-axis)";
const gridColor = "var(--admin-chart-grid)";
const tooltipStyle = {
  background: "var(--admin-chart-tooltip-bg)",
  border: "1px solid var(--admin-chart-tooltip-border)",
  borderRadius: 12,
  color: "var(--admin-chart-tooltip-text)",
  boxShadow: "0 12px 30px rgba(0,0,0,.35)",
};
const tooltipItemStyle = {
  color: "var(--admin-chart-tooltip-text)",
  fontWeight: 600,
};

export const DashboardChartCard = ({
  title,
  subtitle,
  children,
  className = "",
  chartClassName = "h-64",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  chartClassName?: string;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28 }}
    className={`flex h-full min-w-0 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:shadow-lg dark:shadow-black/10 ${className}`}
  >
    <div className="mb-4">
      <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{subtitle}</p>}
    </div>
    <div role="img" aria-label={`${title}${subtitle ? `: ${subtitle}` : ""}`} className={`${chartClassName} mt-auto min-w-0`}>{children}</div>
  </motion.section>
);

const EmptyChart = () => (
  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-500 dark:border-tournament-dark-border">
    Sin datos para este periodo
  </div>
);

const DashboardLineTooltip = ({
  active,
  payload,
  label,
  primaryName,
  secondaryKey,
  secondaryName,
  showHoursEquivalent,
}: {
  active?: boolean;
  payload?: Array<{ payload?: Point }>;
  label?: string;
  primaryName?: string;
  secondaryKey?: string;
  secondaryName?: string;
  showHoursEquivalent?: boolean;
}) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div style={tooltipStyle} className="px-3 py-2 text-sm">
      <p className="mb-1 font-semibold" style={{ color: "var(--admin-chart-tooltip-label)" }}>{label}</p>
      <p className="font-semibold" style={{ color: "var(--admin-chart-tooltip-text)" }}>{primaryName ?? "Valor"}: {point.value}</p>
      {showHoursEquivalent && <p className="font-semibold" style={{ color: "var(--admin-chart-tooltip-text)" }}>Equivalente: {formatHoursEquivalent(point.value)}</p>}
      {secondaryKey && secondaryName && (
        <p className="font-semibold text-emerald-600 dark:text-emerald-400">{secondaryName}: {point[secondaryKey] ?? 0}</p>
      )}
    </div>
  );
};

export const DashboardLineChart = ({
  data,
  color = "#a855f7",
  name = "Valor",
  secondaryKey,
  secondaryName,
  allowDecimals = false,
  showHoursEquivalent = false,
  singleValue = false,
  showDots = true,
  xAxisTicks,
}: {
  data: Point[];
  color?: string;
  name?: string;
  secondaryKey?: string;
  secondaryName?: string;
  allowDecimals?: boolean;
  showHoursEquivalent?: boolean;
  singleValue?: boolean;
  showDots?: boolean;
  xAxisTicks?: Array<string | number>;
}) => {
  const reducedMotion = useReducedMotion();
  const gradientId = `dashboard-line-gradient-${useId().replace(/:/g, "")}`;
  if (data.length === 0) return <EmptyChart />;
  if (singleValue) {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid stroke={gridColor} vertical={false} />
          <XAxis dataKey="label" stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} ticks={xAxisTicks?.map(String)} interval={xAxisTicks ? 0 : undefined} />
          <YAxis stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} allowDecimals={allowDecimals} />
          <Tooltip content={<DashboardLineTooltip primaryName={name} secondaryKey={secondaryKey} secondaryName={secondaryName} showHoursEquivalent={showHoursEquivalent} />} />
          <Bar dataKey="value" name={name} fill={color} radius={[7, 7, 0, 0]} isAnimationActive={!reducedMotion} />
        </BarChart>
      </ResponsiveContainer>
    );
  }
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.38} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} ticks={xAxisTicks?.map(String)} interval={xAxisTicks ? 0 : undefined} />
        <YAxis stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} allowDecimals={allowDecimals} />
        <Tooltip content={<DashboardLineTooltip primaryName={name} secondaryKey={secondaryKey} secondaryName={secondaryName} showHoursEquivalent={showHoursEquivalent} />} />
        <Area type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={3} fill={`url(#${gradientId})`} dot={showDots ? { r: 3, fill: color, strokeWidth: 0 } : false} activeDot={{ r: 6 }} isAnimationActive={!reducedMotion} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const DashboardAreaChart = ({ data, color = "#22c55e", name = "Valor" }: { data: Point[]; color?: string; name?: string }) => {
  const reducedMotion = useReducedMotion();
  const gradientId = `dashboard-area-gradient-${useId().replace(/:/g, "")}`;
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.45} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} formatter={(value) => [value, name]} labelStyle={{ color: "var(--admin-chart-tooltip-label)", fontWeight: 600 }} />
        <Area type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={2.5} fill={`url(#${gradientId})`} isAnimationActive={!reducedMotion} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

type PlayerBreakdown = Breakdown & { href: string };

const openPlayerProfile = (href: string) => {
  window.open(href, "_blank", "noopener,noreferrer");
};

const PlayerAxisTick = ({
  x = 0,
  y = 0,
  payload,
  data,
}: {
  x?: number;
  y?: number;
  payload?: { value?: string };
  data: PlayerBreakdown[];
}) => {
  const name = payload?.value ?? "";
  const player = data.find((entry) => entry.name === name);
  if (!player) return null;

  return (
    <text
      x={x - 8}
      y={y}
      textAnchor="end"
      dominantBaseline="middle"
      fill={axisColor}
      fontSize={11}
      role="link"
      tabIndex={0}
      style={{ cursor: "pointer" }}
      onClick={() => openPlayerProfile(player.href)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openPlayerProfile(player.href);
        }
      }}
    >
      {name}
    </text>
  );
};

export const DashboardPlayerBarChart = ({
  data,
  name = "Puntos",
}: {
  data: PlayerBreakdown[];
  name?: string;
}) => {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) return <EmptyChart />;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart layout="vertical" data={data} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} horizontal={false} />
        <XAxis type="number" stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} allowDecimals={false} />
        <YAxis type="category" dataKey="name" width={132} stroke={axisColor} tickLine={false} axisLine={false} tick={<PlayerAxisTick data={data} />} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} formatter={(value) => [value, name]} labelStyle={{ color: "var(--admin-chart-tooltip-label)", fontWeight: 600 }} cursor={{ fill: "var(--admin-chart-cursor)" }} />
        <Bar
          dataKey="value"
          name={name}
          fill="#a855f7"
          radius={[0, 7, 7, 0]}
          isAnimationActive={!reducedMotion}
          cursor="pointer"
          onClick={(_, index) => {
            const player = data[index];
            if (player) openPlayerProfile(player.href);
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DashboardBarChart = ({ data, color = "#a855f7", name = "Valor", gradient, showHoursEquivalent = false }: { data: Breakdown[]; color?: string; name?: string; gradient?: "purple"; showHoursEquivalent?: boolean }) => {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) return <EmptyChart />;
  const purpleGradientColors = [
    ["#3b1768", "#6d28d9"],
    ["#4c1d95", "#7c3aed"],
    ["#5b21b6", "#9333ea"],
    ["#6d28d9", "#a855f7"],
    ["#7c3aed", "#c084fc"],
    ["#9333ea", "#d8b4fe"],
  ];
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        {gradient && <defs>{data.map((entry, index) => {
          const [from, to] = purpleGradientColors[index % purpleGradientColors.length];
          return <linearGradient key={entry.name} id={`dashboard-${gradient}-${index}`} x1="0" y1="1" x2="0" y2="0"><stop offset="0%" stopColor={from} /><stop offset="100%" stopColor={to} /></linearGradient>;
        })}</defs>}
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} formatter={(value) => [showHoursEquivalent ? `${value} min (${formatHoursEquivalent(Number(value))})` : value, name]} labelStyle={{ color: "var(--admin-chart-tooltip-label)", fontWeight: 600 }} cursor={{ fill: "var(--admin-chart-cursor)" }} />
        <Bar dataKey="value" name={name} radius={[7, 7, 0, 0]} isAnimationActive={!reducedMotion}>
          {data.map((entry, index) => <Cell key={entry.name} fill={gradient ? `url(#dashboard-${gradient}-${index})` : entry.color ?? color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DashboardDonutChart = ({ data }: { data: Breakdown[] }) => {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) return <EmptyChart />;
  const explicitTotal = data.find((entry) => entry.name.toLowerCase().includes("total"))?.value;
  const total = explicitTotal ?? data.reduce((sum, entry) => sum + entry.value, 0);
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="56%" outerRadius="78%" paddingAngle={3} isAnimationActive={!reducedMotion}>
          {data.map((entry, index) => <Cell key={entry.name} fill={entry.color ?? ["#a855f7", "#f59e0b", "#22c55e", "#38bdf8"][index % 4]} />)}
        </Pie>
        <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fill="var(--admin-chart-total)" fontSize="24" fontWeight="700">
          {total}
        </text>
        <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle" fill="var(--admin-chart-axis)" fontSize="11">
          Total
        </text>
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ color: "var(--admin-chart-tooltip-label)", fontWeight: 600 }} formatter={(value, _name, item) => [value, item?.payload?.name ?? "Valor"]} />
        <Legend iconType="circle" wrapperStyle={{ color: "var(--admin-chart-legend)", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
