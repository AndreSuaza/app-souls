import { getAdminPvDashboardAction } from "@/actions/admin/dashboard-analytics.action";
import {
  AdminDashboardHeader,
  AdminDashboardKpis,
  AdminDashboardLink,
  AdminDashboardNav,
  AdminDashboardSelectFilters,
  AdminDashboardUpdatedAt,
} from "@/components/admin/dashboard/AdminDashboardShell";
import {
  DashboardBarChart,
  DashboardChartCard,
  DashboardLineChart,
} from "@/components/admin/dashboard/AdminDashboardCharts";
import { buildNiceIntegerTicks } from "@/logic/admin-dashboard";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
const value = (input: string | string[] | undefined) =>
  Array.isArray(input) ? input[0] : input;

export default async function PvDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const data = await getAdminPvDashboardAction({
    preset: value(params.preset) as "7" | "30" | "90" | "custom" | undefined,
    from: value(params.from),
    to: value(params.to),
    role: value(params.role) as
      | "all"
      | "admin"
      | "store"
      | "news"
      | "player"
      | undefined,
    userStatus: value(params.userStatus) as
      | "all"
      | "active"
      | "inactive"
      | "banned"
      | undefined,
  });
  const topPlayersCount = data.topPlayersAverageSeries.at(-1)?.players ?? 0;
  const topPlayersXAxisTicks = buildNiceIntegerTicks(topPlayersCount);

  return (
    <section className="space-y-6">
      <AdminDashboardHeader
        title="Dashboard de PV"
        description="Controla la distribución, concentración y movimientos de puntos de victoria."
      />
      <AdminDashboardSelectFilters kind="pv" />
      <AdminDashboardNav active="pv" />
      <div className="flex items-center justify-between">
        <AdminDashboardUpdatedAt value={data.updatedAt} />
        <AdminDashboardLink href="/admin/usuarios">
          Gestionar usuarios
        </AdminDashboardLink>
      </div>
      <AdminDashboardKpis items={data.kpis} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <DashboardChartCard
          title="Movimiento neto de PV"
          subtitle="Ajustes manuales y recompensas reclamadas por día"
        >
          <DashboardLineChart
            data={data.movementsSeries}
            name="PV netos"
            color="#22c55e"
            allowDecimals
          />
        </DashboardChartCard>
        <DashboardChartCard
          title="Distribución de usuarios"
          subtitle="Usuarios por rango de saldo actual"
        >
          <DashboardBarChart
            data={data.distribution.map(({ name, value }) => ({ name, value }))}
            name="Usuarios"
          />
        </DashboardChartCard>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardChartCard
          title="Promedio acumulado de los mejores jugadores"
          subtitle="Cada punto muestra el promedio de PV de los mejores X jugadores; el eje va de 0 al total de usuarios."
          chartClassName="h-72"
        >
          <DashboardLineChart
            data={data.topPlayersAverageSeries}
            name="PV promedio"
            color="#f59e0b"
            secondaryKey="players"
            secondaryName="Jugadores incluidos"
            allowDecimals
            showDots={data.topPlayersAverageSeries.length <= 100}
            xAxisTicks={topPlayersXAxisTicks}
          />
        </DashboardChartCard>
        <DashboardChartCard
          title="Mayores saldos"
          subtitle="Top 10 usuarios con más PV"
          chartClassName="h-72"
        >
          <DashboardBarChart
            data={data.topUsers}
            name="PV"
            color="#22c55e"
          />
        </DashboardChartCard>
      </div>
    </section>
  );
}
