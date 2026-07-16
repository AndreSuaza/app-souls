import { getAdminCardPropertiesAction } from "@/actions/cards/admin-cards.action";
import { AdminCardForm } from "@/components/cartas/admin/AdminCardForm";

export default async function CreateAdminCardPage() {
  const properties = await getAdminCardPropertiesAction();

  return (
    <AdminCardForm
      mode="create"
      properties={properties}
      cancelHref="/admin/cartas"
    />
  );
}
