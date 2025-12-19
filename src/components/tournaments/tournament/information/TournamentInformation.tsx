"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useTournamentStore,
  useToastStore,
  useAlertConfirmationStore,
} from "@/store";
import { TournamentInfoCard } from "./TournamentInfoCard";
import { TournamentInfoActions } from "./TournamentInfoActions";

export const TournamentInformation = () => {
  const router = useRouter();

  const { tournament, updateTournamentInfo, deleteTournament } =
    useTournamentStore();
  const showToast = useToastStore((s) => s.showToast);
  const confirm = useAlertConfirmationStore((s) => s.openAlertConfirmation);

  if (!tournament) return null;

  const isFinished = tournament.status === "finished";

  const [form, setForm] = useState({
    title: tournament.title,
    description: tournament.description ?? "",
    date: new Date(tournament.date),
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Detectar cambios reales
  useEffect(() => {
    const changed =
      form.title !== tournament.title ||
      form.description !== (tournament.description ?? "") ||
      form.date.toISOString() !== tournament.date;

    setHasChanges(changed);
  }, [form, tournament]);

  const handleSave = () => {
    confirm({
      text: "¿Guardar cambios?",
      description: "Se actualizará la información básica del torneo.",
      action: async () => {
        const success = await updateTournamentInfo(form);

        if (success) {
          showToast(
            "Información del torneo actualizada correctamente",
            "success"
          );
          return true;
        }

        showToast("Error actualizando el torneo", "error");
        return false;
      },
    });
  };

  const handleDelete = () => {
    confirm({
      text: "¿Cancelar torneo?",
      description:
        "Esta acción eliminará el torneo de forma permanente y no se puede deshacer.",
      action: async () => {
        const success = await deleteTournament();

        if (success) {
          showToast("Torneo cancelado correctamente", "success");
          router.replace("/administrador/torneos");
          return true;
        }

        showToast("No se pudo cancelar el torneo", "error");
        return false;
      },
    });
  };

  const handleDiscard = () => {
    setForm({
      title: tournament.title,
      description: tournament.description ?? "",
      date: new Date(tournament.date),
    });
  };

  return (
    <div className="space-y-6">
      <TournamentInfoCard
        form={form}
        onChange={setForm}
        onDelete={handleDelete}
        isFinished={isFinished}
      />

      {!isFinished && (
        <TournamentInfoActions
          hasChanges={hasChanges}
          onSave={handleSave}
          onDiscard={handleDiscard}
        />
      )}
    </div>
  );
};
