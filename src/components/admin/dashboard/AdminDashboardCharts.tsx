"use client";

import { useReducedMotion, motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Point = { date?: string; label: string; value: number; [key: string]: string | number | undefined };
type Breakdown = { name: string; value: number; color?: string };

const axisColor = "#9d8aae";
const gridColor = "rgba(157,138,174,.18)";
const tooltipStyle = {
  background: "#21162d",
  border: "1px solid #6b3ea2",
  borderRadius: 12,
  color: "#fff",
  boxShadow: "0 12px 30px rgba(0,0,0,.35)",
};
const tooltipItemStyle = { color: "#f8fafc", fontWeight: 600 };

export const DashboardChartCard = ({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <motion.section
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.28 }}
    className={`min-w-0 rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface p-5 shadow-lg shadow-black/10 ${className}`}
  >
    <div className="mb-4">
      <h2 className="text-base font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
    </div>
    <div role="img" aria-label={`${title}${subtitle ? `: ${subtitle}` : ""}`} className="h-64 min-w-0">{children}</div>
  </motion.section>
);

const EmptyChart = () => (
  <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-tournament-dark-border text-sm text-slate-500">
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
}: {
  active?: boolean;
  payload?: Array<{ payload?: Point }>;
  label?: string;
  primaryName?: string;
  secondaryKey?: string;
  secondaryName?: string;
}) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div style={tooltipStyle} className="px-3 py-2 text-sm">
      <p className="mb-1 font-semibold text-violet-200">{label}</p>
      <p className="font-semibold text-slate-50">{primaryName ?? "Valor"}: {point.value}</p>
      {secondaryKey && secondaryName && (
        <p className="font-semibold text-emerald-400">{secondaryName}: {point[secondaryKey] ?? 0}</p>
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
}: {
  data: Point[];
  color?: string;
  name?: string;
  secondaryKey?: string;
  secondaryName?: string;
  allowDecimals?: boolean;
}) => {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" stroke={axisColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={allowDecimals} />
        <Tooltip content={<DashboardLineTooltip primaryName={name} secondaryKey={secondaryKey} secondaryName={secondaryName} />} />
        <Line type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={3} dot={{ r: 3, fill: color, strokeWidth: 0 }} activeDot={{ r: 6 }} isAnimationActive={!reducedMotion} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const DashboardAreaChart = ({ data, color = "#22c55e", name = "Valor" }: { data: Point[]; color?: string; name?: string }) => {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs><linearGradient id="dashboard-area-gradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.45} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="label" stroke={axisColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} formatter={(value) => [value, name]} labelStyle={{ color: "#bbf7d0", fontWeight: 600 }} />
        <Area type="monotone" dataKey="value" name={name} stroke={color} strokeWidth={2.5} fill="url(#dashboard-area-gradient)" isAnimationActive={!reducedMotion} />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export const DashboardBarChart = ({ data, color = "#a855f7", name = "Valor" }: { data: Breakdown[]; color?: string; name?: string }) => {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke={gridColor} vertical={false} />
        <XAxis dataKey="name" stroke={axisColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
        <YAxis stroke={axisColor} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} formatter={(value) => [value, name]} labelStyle={{ color: "#ddd6fe", fontWeight: 600 }} cursor={{ fill: "rgba(168,85,247,.08)" }} />
        <Bar dataKey="value" name={name} radius={[7, 7, 0, 0]} isAnimationActive={!reducedMotion}>
          {data.map((entry) => <Cell key={entry.name} fill={entry.color ?? color} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export const DashboardDonutChart = ({ data }: { data: Breakdown[] }) => {
  const reducedMotion = useReducedMotion();
  if (data.length === 0) return <EmptyChart />;
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius="56%" outerRadius="78%" paddingAngle={3} isAnimationActive={!reducedMotion}>
          {data.map((entry, index) => <Cell key={entry.name} fill={entry.color ?? ["#a855f7", "#f59e0b", "#22c55e", "#38bdf8"][index % 4]} />)}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} itemStyle={tooltipItemStyle} labelStyle={{ color: "#f5d0fe", fontWeight: 600 }} formatter={(value, _name, item) => [value, item?.payload?.name ?? "Valor"]} />
        <Legend iconType="circle" wrapperStyle={{ color: "#d8cbe2", fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
