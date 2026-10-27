"use client";

import {
  forceFinishAdminSimulatorRoomAction,
  getAdminSimulatorControlAction,
  getAdminSimulatorRoomsAction,
  type SimulatorAdminControl,
  type SimulatorAdminRoom,
  type SimulatorAdminRooms,
  updateAdminSimulatorControlAction,
} from "@/actions/admin/simulator-admin.action";
import { useAlertConfirmationStore, useToastStore } from "@/store";
import { useCallback, useState, useTransition } from "react";
import {
  IoCheckmarkOutline,
  IoCloseOutline,
  IoCreateOutline,
  IoEyeOutline,
  IoGameControllerOutline,
  IoRefreshOutline,
  IoStopCircleOutline,
} from "react-icons/io5";

const defaultMessage =
  "El simulador está en mantenimiento. Las partidas en curso pueden continuar.";

type Props = {
  initialControl: SimulatorAdminControl | null;
  initialRooms: SimulatorAdminRooms | null;
  initialError?: string;
};

export function SimulatorAdministration({
  initialControl,
  initialRooms,
  initialError,
}: Props) {
  const [control, setControl] = useState(initialControl);
  const [rooms, setRooms] = useState<SimulatorAdminRoom[]>(
    initialRooms?.rooms ?? [],
  );
  const [message, setMessage] = useState(
    initialControl?.message ?? defaultMessage,
  );
  const [draftMessage, setDraftMessage] = useState(
    initialControl?.message ?? defaultMessage,
  );
  const [isMessageEditorOpen, setIsMessageEditorOpen] = useState(false);
  const [error, setError] = useState(initialError ?? "");
  const [isPending, startTransition] = useTransition();
  const showToast = useToastStore((state) => state.showToast);
  const openConfirmation = useAlertConfirmationStore(
    (state) => state.openAlertConfirmation,
  );

  const refresh = useCallback(() => {
    startTransition(async () => {
      try {
        const [nextControl, nextRooms] = await Promise.all([
          getAdminSimulatorControlAction(),
          getAdminSimulatorRoomsAction(),
        ]);
        setControl(nextControl);
        setMessage(nextControl.message);
        setDraftMessage(nextControl.message);
        setRooms(nextRooms.rooms);
        setError("");
      } catch (refreshError) {
        const text =
          refreshError instanceof Error
            ? refreshError.message
            : "No se pudo actualizar el panel.";
        setError(text);
        showToast(text, "error");
      }
    });
  }, [showToast]);

  const saveControl = (
    mode: "normal" | "draining",
    nextMessage = message,
    onSaved?: () => void,
  ) =>
    new Promise<boolean>((resolve) => {
      startTransition(async () => {
        try {
          const nextControl = await updateAdminSimulatorControlAction({
            mode,
            message: nextMessage,
          });
          setControl(nextControl);
          setMessage(nextControl.message);
          setError("");
          showToast(
            mode === "draining" ? "Drenaje activado." : "Drenaje desactivado.",
            "success",
          );
          onSaved?.();
          refresh();
          resolve(true);
        } catch (saveError) {
          const text =
            saveError instanceof Error
              ? saveError.message
              : "No se pudo actualizar el control.";
          setError(text);
          showToast(text, "error");
          resolve(false);
        }
      });
    });

  const finishRoom = (room: SimulatorAdminRoom) => {
    openConfirmation({
      text: "¿Finalizar esta partida?",
      description: (
        <>
          La sala{" "}
          <strong>
            <em>{room.roomId}</em>
          </strong>{" "}
          se marcará como completada y ya no podrá continuar ni aceptar
          revancha.
        </>
      ),
      confirmText: "FINALIZAR",
      confirmPlaceholder: "FINALIZAR",
      action: async () => {
        try {
          await forceFinishAdminSimulatorRoomAction(room.roomId);
          return true;
        } catch (finishError) {
          showToast(
            finishError instanceof Error
              ? finishError.message
              : "No se pudo finalizar la partida.",
            "error",
          );
          return false;
        }
      },
      onSuccess: () => {
        showToast("Partida finalizada correctamente.", "success");
        refresh();
      },
    });
  };

  const isDraining = control?.mode === "draining";

  const confirmDrainChange = () => {
    const nextMode = isDraining ? "normal" : "draining";
    openConfirmation({
      text: isDraining ? "¿Desactivar el drenaje?" : "¿Activar el drenaje?",
      description: isDraining
        ? "Se volverán a permitir nuevas salas, búsquedas de partidas y revancha."
        : "Se bloquearán nuevas salas, búsquedas y revancha, pero las partidas iniciadas podrán continuar.",
      action: () => saveControl(nextMode),
    });
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-purple-300">
            <IoGameControllerOutline aria-hidden="true" /> Administración
            operativa
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Administración del simulador
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Prepara actualizaciones sin interrumpir las partidas que ya están en
            curso.
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isPending}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-tournament-dark-border px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IoRefreshOutline size={18} aria-hidden="true" /> Actualizar
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1.9fr]">
        <section className="space-y-5 rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Modo de actualización
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Las partidas iniciadas podrán terminar y reconectarse.
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${isDraining ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}
            >
              {isDraining ? "Drenando" : "Normal"}
            </span>
          </div>

          <label className="block space-y-2">
            <span className="flex items-center justify-between gap-3 text-xs font-bold uppercase tracking-wide text-slate-400">
              <span>Mensaje para jugadores</span>
              <button
                type="button"
                title="Editar mensaje para jugadores"
                aria-label="Editar mensaje para jugadores"
                onClick={() => {
                  setDraftMessage(message);
                  setIsMessageEditorOpen(true);
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-tournament-dark-border text-slate-300 transition hover:border-purple-400 hover:text-white"
              >
                <IoCreateOutline size={16} aria-hidden="true" />
              </button>
            </span>
            <div className="min-h-[108px] rounded-xl border border-tournament-dark-border bg-tournament-dark-muted px-3 py-3 text-sm leading-relaxed text-slate-200">
              {message}
            </div>
            <span className="block text-right text-xs text-slate-500">
              {message.length}/300
            </span>
          </label>

          <div className="flex flex-col gap-3 border-t border-tournament-dark-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                setMessage(defaultMessage);
                setDraftMessage(defaultMessage);
                saveControl(control?.mode ?? "normal", defaultMessage);
              }}
              className="text-left text-xs font-semibold text-purple-300 transition hover:text-white disabled:opacity-60"
            >
              Restaurar mensaje predeterminado
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={confirmDrainChange}
              className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-bold transition disabled:opacity-60 ${isDraining ? "border border-tournament-dark-border text-slate-200 hover:border-purple-400" : "bg-amber-500 text-slate-950 hover:bg-amber-400"}`}
            >
              {isDraining ? "Desactivar drenaje" : "Activar drenaje"}
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                Partidas en curso
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Supervisa las salas que deben terminar antes del despliegue.
              </p>
            </div>
            <span className="rounded-full bg-purple-500/15 px-3 py-1 text-sm font-bold text-purple-200">
              {rooms.length}
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {rooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-tournament-dark-border p-8 text-center text-sm text-slate-500">
                No hay partidas activas en este momento.
              </div>
            ) : (
              rooms.map((room) => (
                <RoomCard
                  key={room.roomId}
                  room={room}
                  onFinish={() => finishRoom(room)}
                />
              ))
            )}
          </div>
        </section>
      </div>

      {isMessageEditorOpen ? (
        <div
          className="fixed inset-0 z-[9997] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="simulator-message-title"
        >
          <button
            type="button"
            aria-label="Cerrar editor de mensaje"
            onClick={() => setIsMessageEditorOpen(false)}
            className="absolute inset-0 cursor-default bg-black/60 backdrop-blur-sm"
          />
          <div className="relative z-10 w-full max-w-lg space-y-5 rounded-2xl border border-tournament-dark-border bg-tournament-dark-surface p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="simulator-message-title" className="text-xl font-bold">
                  Editar mensaje
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Este texto se mostrará cuando el simulador no acepte nuevas
                  partidas.
                </p>
              </div>
              <button
                type="button"
                title="Cerrar editor"
                aria-label="Cerrar editor"
                onClick={() => setIsMessageEditorOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-tournament-dark-border text-slate-300 transition hover:border-purple-400 hover:text-white"
              >
                <IoCloseOutline size={20} aria-hidden="true" />
              </button>
            </div>
            <textarea
              autoFocus
              value={draftMessage}
              maxLength={300}
              onChange={(event) => setDraftMessage(event.target.value)}
              rows={5}
              className="w-full rounded-xl border border-tournament-dark-border bg-tournament-dark-muted px-3 py-3 text-sm leading-relaxed text-white outline-none focus:border-purple-400"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">
                {draftMessage.length}/300
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setIsMessageEditorOpen(false)}
                  className="rounded-lg border border-tournament-dark-border px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-purple-400 disabled:opacity-60"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={isPending || !draftMessage.trim()}
                  onClick={() =>
                    saveControl(control?.mode ?? "normal", draftMessage, () =>
                      setIsMessageEditorOpen(false),
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-60"
                >
                  <IoCheckmarkOutline aria-hidden="true" /> Guardar
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RoomCard({
  room,
  onFinish,
}: {
  room: SimulatorAdminRoom;
  onFinish: () => void;
}) {
  const hasStarted =
    room.matchStatus !== "waitingForPlayers" && room.players.length >= 2;

  return (
    <details className="rounded-xl border border-tournament-dark-border bg-tournament-dark-muted/50 p-4">
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-white">
            {room.players.map((player) => player.nickname).join(" vs ") ||
              room.roomId}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {room.roomId} · {formatMatchStatus(room.matchStatus)} ·{" "}
            {formatDate(room.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${room.matchStatus === "inProgress" ? "bg-emerald-500/15 text-emerald-300" : "bg-purple-500/15 text-purple-200"}`}
          >
            {room.matchMode === "bestOf3" ? "Mejor de 3" : "Mejor de 1"}
          </span>
          {hasStarted ? (
            <div
              className="flex items-center gap-1.5"
              role="group"
              aria-label="Acciones de la partida"
            >
              {room.spectatorUrl ? (
                <button
                  type="button"
                  title="Espectar partida en una nueva pestaña"
                  aria-label="Espectar partida en una nueva pestaña"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    window.open(
                      room.spectatorUrl,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-purple-400/30 bg-purple-500/10 text-purple-200 transition hover:border-purple-300 hover:bg-purple-500/20 hover:text-white"
                >
                  <IoEyeOutline size={17} aria-hidden="true" />
                </button>
              ) : null}
              <button
                type="button"
                title="Finalizar partida"
                aria-label="Finalizar partida"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onFinish();
                }}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 transition hover:border-red-300 hover:bg-red-500/20 hover:text-white"
              >
                <IoStopCircleOutline size={17} aria-hidden="true" />
              </button>
            </div>
          ) : null}
        </div>
      </summary>
      <div className="mt-4 space-y-3 border-t border-tournament-dark-border pt-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {room.players.map((player) => (
            <div
              key={player.userId}
              className="rounded-lg border border-tournament-dark-border p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-white">
                  {player.nickname}
                </span>
                <span className="text-slate-400">{player.lives} vidas</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {player.connectionStatus === "connected"
                  ? "Conectado"
                  : "Desconectado"}{" "}
                · {player.seat}
              </p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
          <span>Fase: {room.phase}</span>
          <span>Espectadores: {room.spectatorCount}</span>
          <span>
            Entrada:{" "}
            {room.entryMode === "matchmaking" ? "Matchmaking" : "Manual"}
          </span>
        </div>
      </div>
    </details>
  );
}

function formatMatchStatus(status: SimulatorAdminRoom["matchStatus"]) {
  return {
    setup: "Preparación",
    mulligan: "Mulligan",
    inProgress: "En curso",
    waitingForPlayers: "Esperando jugadores",
    completed: "Finalizada",
  }[status];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Bogota",
  }).format(new Date(value));
}
