import {
  getCompetitiveSeasonDashboardAction,
  listCompetitiveSeasonsAction,
} from "@/actions/admin/competitive-season.action";
import { CompetitiveSeasonManager } from "@/components/admin/competitive-seasons/CompetitiveSeasonManager";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

export default async function CompetitiveSeasonsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const seasons = await listCompetitiveSeasonsAction();
  const selectedId = first(params.seasonId) ?? seasons.find((season) => season.status === "ACTIVE")?.id ?? seasons[0]?.id;
  const dashboard = selectedId
    ? await getCompetitiveSeasonDashboardAction({
        seasonId: selectedId,
        page: Number(first(params.page) ?? "1") || 1,
      })
    : null;

  return (
    <CompetitiveSeasonManager
      seasons={seasons}
      initialSeasonId={selectedId ?? null}
      initialDashboard={dashboard}
    />
  );
}
