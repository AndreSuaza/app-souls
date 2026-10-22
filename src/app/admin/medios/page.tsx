import { AdminMediaHub } from "@/components/media/admin/AdminMediaHub";

interface Props {
  searchParams: Promise<{
    section?: string;
    group?: string;
  }>;
}

export default async function Page({ searchParams }: Props) {
  const { section, group } = await searchParams;
  const initialView =
    section === "cosmetics"
      ? "cosmetics"
      : group === "events" || group === "products"
        ? group
        : "news";

  return <AdminMediaHub initialView={initialView} />;
}
