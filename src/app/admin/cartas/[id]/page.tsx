import { notFound } from "next/navigation";
import {
  getAdminCardByIdAction,
  getAdminCardPropertiesAction,
} from "@/actions/cards/admin-cards.action";
import { AdminCardForm } from "@/components/cartas/admin/AdminCardForm";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAdminCardPage({ params }: Props) {
  const { id } = await params;
  const [card, properties] = await Promise.all([
    getAdminCardByIdAction({ cardId: id }),
    getAdminCardPropertiesAction(),
  ]);

  if (!card) notFound();

  return (
    <AdminCardForm
      mode="edit"
      card={card}
      properties={properties}
      cancelHref="/admin/cartas"
    />
  );
}
