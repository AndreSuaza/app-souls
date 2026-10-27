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
            data={data.distribution}
            name="Usuarios"
            gradient="purple"
          />
        </DashboardChartCard>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardChartCard
          title="PV por rol"
          subtitle="Saldo total de PV según el rol actual"
        >
          <DashboardBarChart data={data.roleBreakdown} name="PV" />
        </DashboardChartCard>
        <DashboardChartCard
          title="Mayores saldos"
          subtitle="Top 10 usuarios con más PV"
        >
          <DashboardBarChart data={data.topUsers} name="PV" color="#a855f7" />
        </DashboardChartCard>
      </div>
    </section>
  );
}
