import { getAdminCardPropertiesAction } from "@/actions/cards/admin-cards.action";
import { AdminCardsManager } from "@/components/cartas/admin/AdminCardsManager";

export default async function AdminCardsPage() {
  const properties = await getAdminCardPropertiesAction();

  return <AdminCardsManager properties={properties} />;
}
