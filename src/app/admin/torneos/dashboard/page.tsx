import {
  getAdminDashboardOptionsAction,
  getAdminTournamentDashboardAction,
  getAdminTournamentDashboardOptionsAction,
} from "@/actions/admin/dashboard-analytics.action";
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
  DashboardDonutChart,
  DashboardLineChart,
  DashboardPlayerBarChart,
} from "@/components/admin/dashboard/AdminDashboardCharts";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
const value = (input: string | string[] | undefined) =>
  Array.isArray(input) ? input[0] : input;

export default async function TournamentDashboardPage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const selectedTournament = Boolean(value(params.tournamentId));
  const [data, stores, tournaments] = await Promise.all([
    getAdminTournamentDashboardAction({
      preset: value(params.preset) as "7" | "30" | "90" | "custom" | undefined,
      from: value(params.from),
      to: value(params.to),
      storeId: value(params.storeId),
      tournamentId: value(params.tournamentId),
      format: value(params.format) as
        | "all"
        | "Masters"
        | "Elimination"
        | undefined,
      status: value(params.status) as
        | "all"
        | "pending"
        | "in_progress"
        | "finished"
        | "cancelled"
        | undefined,
    }),
    getAdminDashboardOptionsAction(),
    getAdminTournamentDashboardOptionsAction(),
  ]);
  return (
    <section className="space-y-6">
      <AdminDashboardHeader
        title="Dashboard de torneos"
        description="Mide participación, operación y finalización de los torneos."
      />
      <AdminDashboardSelectFilters
        kind="tournaments"
        stores={stores}
        tournaments={tournaments}
      />
      <AdminDashboardNav active="torneos" />
      <div className="flex items-center justify-between">
        <AdminDashboardUpdatedAt value={data.updatedAt} />
        <AdminDashboardLink href="/admin/torneos">
          Gestionar torneos
        </AdminDashboardLink>
      </div>
      <AdminDashboardKpis items={data.kpis} />
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <DashboardChartCard
          title="Torneos creados"
          subtitle="Evolución durante el periodo"
        >
          <DashboardLineChart
            data={data.createdSeries}
            name="Torneos"
            secondaryKey="players"
            secondaryName="Jugadores inscritos"
            singleValue={selectedTournament}
          />
        </DashboardChartCard>
        <DashboardChartCard title="Estados" subtitle="Torneos por estado">
          <DashboardDonutChart data={data.statusBreakdown} />
        </DashboardChartCard>
      </div>

      {selectedTournament && (
        <DashboardChartCard
          title="Jugadores inscritos"
          subtitle="Ordenados de mayor a menor según los puntos obtenidos"
          chartClassName="h-[28rem]"
        >
          <DashboardPlayerBarChart data={data.playersRanking} />
        </DashboardChartCard>
      )}
      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardChartCard
          title="Formatos"
          subtitle="Masters y eliminación directa"
        >
          <DashboardBarChart data={data.formatBreakdown} name="Torneos" />
        </DashboardChartCard>
        <DashboardChartCard
          title="Tamaño promedio de los torneos"
          subtitle="Promedio de jugadores inscritos por torneo y día"
        >
          <DashboardLineChart
            data={data.averagePlayersSeries}
            name="Jugadores por torneo"
            color="#22c55e"
            allowDecimals
            singleValue={selectedTournament}
          />
        </DashboardChartCard>
      </div>
      <DashboardChartCard
        title="Duración promedio por día"
        subtitle="Minutos desde el inicio hasta la finalización"
      >
        <DashboardLineChart
          data={data.durationSeries}
          name="Minutos"
          color="#f97316"
          allowDecimals
          showHoursEquivalent
          singleValue={selectedTournament}
        />
      </DashboardChartCard>
    </section>
  );
}
