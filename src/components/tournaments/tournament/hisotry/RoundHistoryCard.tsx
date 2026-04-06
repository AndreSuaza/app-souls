"use client";

import { useState } from "react";
import { IoPencil, IoSave, IoClose, IoPrintOutline } from "react-icons/io5";
import { RoundInterface, TournamentPlayerInterface } from "@/interfaces";
import {
  BasicTournament,
  useTournamentStore,
  useAlertConfirmationStore,
  useUIStore,
  useToastStore,
} from "@/store";
import { RoundHistoryCardBase } from "./RoundHistoryCardBase";
import { getAvatarUrl } from "@/utils/avatar-image";

interface Props {
  round: RoundInterface;
  tournament: BasicTournament;
  players: TournamentPlayerInterface[];
}

export const RoundHistoryCard = ({ round, tournament, players }: Props) => {
  const { editRoundResults, recalculateCurrentRound, rounds } =
    useTournamentStore();
  const openAlertConfirmation = useAlertConfirmationStore(
    (s) => s.openAlertConfirmation
  );
  const { showLoading, hideLoading } = useUIStore();
  const showToast = useToastStore((s) => s.showToast);

  // Estado de la ronda calculado inline
  const lastRoundNumber =
    tournament.status === "finished"
      ? tournament.currentRoundNumber
      : tournament.currentRoundNumber + 1;

  const isLastRound = round.roundNumber === lastRoundNumber;

  // Controla si esta ronda esta en modo edicion
  const [isEditing, setIsEditing] = useState(false);
  // Controla si la card está expandida
  const [expanded, setExpanded] = useState(isLastRound);

  // Copia local editable de los matchs (NO se guarda hasta confirmar)
  const [editableMatches, setEditableMatches] = useState(round.matches);

  const status =
    tournament.status === "in_progress" && isLastRound
      ? "IN_PROGRESS"
      : "FINISHED";

  const currentRoundNumber = tournament.currentRoundNumber + 1;
  const isCurrentRound = round.roundNumber === currentRoundNumber;
  // Solo se imprime la ronda actual mientras el torneo esta en progreso.
  const canPrintRound = tournament.status === "in_progress" && isCurrentRound;

  // Determina si la ronda puede editarse
  const canEditRound =
    tournament.status === "in_progress" &&
    round.roundNumber < tournament.currentRoundNumber + 1;

  const TEN_MINUTES_MS = 10 * 60 * 1000;

  const handleEdit = () => {
    // Si es la ronda actual, ir a pestana Ronda actual
    if (status === "IN_PROGRESS") {
      window.dispatchEvent(
        new CustomEvent("changeTournamentTab", {
          detail: "currentRound",
        })
      );
      return;
    }

    setEditableMatches(structuredClone(round.matches));
    setExpanded(true); // abre la card al editar
    setIsEditing(true);
  };

  const handleSave = () => {
    openAlertConfirmation({
      text: "Guardar cambios de la ronda",
      description:
        "¿Estas seguro de que deseas guardar los cambios realizados en esta ronda?",
      action: async () => {
        try {
          showLoading("Guardando resultados de la ronda...");

          await editRoundResults(round.roundNumber, editableMatches);

          setIsEditing(false);

          showToast("Ronda editada correctamente.", "success");

          const currentRound =
            rounds.length > 0 ? rounds[rounds.length - 1] : null;
          const isCurrentRound =
            currentRound?.roundNumber === tournament.currentRoundNumber + 1;

          // Si existe ronda actual, se decide el recalc segun el estado del inicio.
          if (currentRound && isCurrentRound) {
            if (!currentRound.startedAt) {
              showLoading("Recalculando ronda...");
              try {
                const success = await recalculateCurrentRound();
                if (success) {
                  showToast("Ronda recalculada", "info");
                } else {
                  showToast("Error al recalcular la ronda", "error");
                }
              } finally {
                hideLoading();
              }
            } else {
              const startedAtMs = new Date(currentRound.startedAt).getTime();
              const elapsed = Date.now() - startedAtMs;

              if (!Number.isNaN(startedAtMs) && elapsed < TEN_MINUTES_MS) {
                hideLoading();
                openAlertConfirmation({
                  text: "¿Recalcular la ronda actual?",
                  description:
                    "Se reiniciara la ronda y se generaran nuevos emparejamientos.",
                  action: async () => {
                    showLoading("Recalculando ronda...");
                    try {
                      return await recalculateCurrentRound();
                    } finally {
                      hideLoading();
                    }
                  },
                  onSuccess: () => {
                    showToast("Ronda recalculada", "info");
                  },
                  onError: () => {
                    showToast("Error al recalcular la ronda", "error");
                  },
                });
              }
            }
          }

          return true;
        } catch {
          showToast(
            "Ocurrio un error al guardar los cambios de la ronda.",
            "error"
          );

          return false;
        } finally {
          hideLoading();
        }
      },
    });
  };

  const handleCancel = () => {
    setEditableMatches(round.matches);
    setIsEditing(false);
  };

  // Actualiza el resultado de un match SOLO en la copia local editable
  const handleLocalResultChange = (
    matchId: string,
    result: "P1" | "P2" | "DRAW"
  ) => {
    setEditableMatches((prev) =>
      prev.map((match) => (match.id === matchId ? { ...match, result } : match))
    );
  };

  const formatPrintDate = () => {
    const now = new Date();
    const date = now.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return `${date} - ${time}`;
  };

  const formatPrintOnlyDate = () => {
    const now = new Date();
    return now.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const resolvePlayer = (playerId: string) =>
    players.find((player) => player.id === playerId);

  const renderPlayerCell = (playerId: string | null) => {
    if (!playerId) {
      return {
        avatar: getAvatarUrl(),
        nickname: "BYE",
        fullName: "",
      };
    }

    const player = resolvePlayer(playerId);
    if (!player) {
      return {
        avatar: getAvatarUrl(),
        nickname: "Jugador",
        fullName: "",
      };
    }

    const fullName = `${player.name ?? ""} ${player.lastname ?? ""}`.trim();

    return {
      avatar: getAvatarUrl(player.image),
      nickname: player.playerNickname,
      fullName,
    };
  };

  const buildPrintHtml = () => {
    // Se construye HTML plano para imprimir la ronda sin depender del layout actual.
    const printDate = formatPrintDate();
    const printOnlyDate = formatPrintOnlyDate();

    const rows = round.matches
      .map((match, index) => {
        const tableNumber = index + 1;
        const player1 = renderPlayerCell(match.player1Id);
        const player2 = renderPlayerCell(match.player2Id);

        return `
          <tr>
            <td class="table-number" rowspan="2">
              <div class="table-meta">
                <span class="table-date">${printOnlyDate}</span>
                <span class="table-round">Ronda ${round.roundNumber}</span>
                <span class="table-seat">Mesa ${tableNumber}</span>
              </div>
            </td>
            <td class="player-cell">
              <div class="player-info">
                <img src="${player1.avatar}" alt="${player1.nickname}" />
                <div>
                  <p class="nickname">${player1.nickname}</p>
                  ${
                    player1.fullName
                      ? `<p class="fullname">${player1.fullName}</p>`
                      : ""
                  }
                </div>
              </div>
            </td>
            <td class="result-cell" rowspan="2">
              <div class="result-box">
                <div class="result-item">
                  <span class="result-label">Victoria J1</span>
                  <span class="result-check"></span>
                </div>
                <div class="result-item">
                  <span class="result-label">Empate</span>
                  <span class="result-check"></span>
                </div>
                <div class="result-item">
                  <span class="result-label">Victoria J2</span>
                  <span class="result-check"></span>
                </div>
              </div>
            </td>
            <td class="player-cell">
              <div class="player-info">
                <img src="${player2.avatar}" alt="${player2.nickname}" />
                <div>
                  <p class="nickname">${player2.nickname}</p>
                  ${
                    player2.fullName
                      ? `<p class="fullname">${player2.fullName}</p>`
                      : ""
                  }
                </div>
              </div>
            </td>
          </tr>
          <tr class="signature-row">
            <td class="signature">Firma: ____________________________________</td>
            <td class="signature">Firma: ____________________________________</td>
          </tr>
        `;
      })
      .join("");

    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Ronda ${round.roundNumber} - ${tournament.title}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              font-family: "Arial", sans-serif;
              color: #0f172a;
              margin: 0;
              padding: 12px;
              background: #ffffff;
            }
            @page {
              margin: 10mm;
            }
            .header {
              display: flex;
              align-items: flex-start;
              justify-content: space-between;
              gap: 24px;
              padding: 8px 12px 12px;
              border-bottom: 1px solid #e2e8f0;
              background: #ffffff;
              color: #0f172a;
            }
            .header-left {
              display: flex;
              align-items: center;
              gap: 16px;
            }
            .header-left img {
              width: 56px;
              height: 56px;
              object-fit: contain;
            }
            .header-title {
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 0.4px;
            }
            .header-subtitle {
              font-size: 13px;
              color: #64748b;
              margin-top: 2px;
            }
            .header-right {
              text-align: right;
              font-size: 12px;
              line-height: 1.4;
              color: #64748b;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              overflow: hidden;
            }
            thead {
              background: #f8fafc;
            }
            th {
              text-align: left;
              padding: 12px 16px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #475569;
            }
            td {
              padding: 12px 16px;
              border-top: 1px solid #e2e8f0;
              vertical-align: middle;
            }
            .table-number {
              text-align: center;
              font-weight: 700;
              font-size: 12px;
              color: #1f2937;
              width: 110px;
              background: #f1f5f9;
            }
            .table-meta {
              display: flex;
              flex-direction: column;
              gap: 4px;
              align-items: center;
              font-weight: 600;
            }
            .table-date {
              font-size: 10px;
              color: #475569;
            }
            .table-round {
              font-size: 11px;
            }
            .table-seat {
              font-size: 12px;
              font-weight: 700;
            }
            .player-info {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .player-info img {
              width: 36px;
              height: 36px;
              border-radius: 999px;
              object-fit: cover;
              border: 1px solid #e2e8f0;
            }
            .nickname {
              font-weight: 600;
              font-size: 13px;
              margin: 0;
            }
            .fullname {
              font-size: 11px;
              color: #64748b;
              margin: 2px 0 0;
            }
            .result-cell {
              text-align: center;
              width: 240px;
            }
            .result-box {
              display: flex;
              justify-content: space-between;
              gap: 8px;
              font-weight: 600;
              font-size: 11px;
              color: #475569;
            }
            .result-item {
              flex: 1;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 6px;
            }
            .result-label {
              text-align: center;
              white-space: nowrap;
            }
            .result-check {
              width: 16px;
              height: 16px;
              border: 1px solid #94a3b8;
              border-radius: 2px;
            }
            .signature-row td {
              padding-top: 8px;
              padding-bottom: 16px;
              font-size: 11px;
              color: #475569;
            }
            .signature {
              border-top: 1px dashed #cbd5f5;
              padding-top: 8px;
            }
            footer {
              margin-top: 24px;
              font-size: 10px;
              color: #94a3b8;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <img src="/logo-six.webp" alt="Souls In Xtinction" />
              <div>
                <div class="header-title">Souls In Xtinction TCG</div>
                <div class="header-subtitle">${tournament.title}</div>
              </div>
            </div>
            <div class="header-right">
              <div>${printDate}</div>
              <div>Ronda ${round.roundNumber}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Mesa</th>
                <th>Jugador 1</th>
                <th>Resultado</th>
                <th>Jugador 2</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <footer>
            <span>Souls In Xtinction TCG</span>
            <span>Hoja de resultados - Ronda ${round.roundNumber}</span>
          </footer>
        </body>
      </html>
    `;
  };

  const handlePrintRound = () => {
    // Se abre una ventana nueva para renderizar el documento y llamar a print().
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) return;

    printWindow.document.write(buildPrintHtml());
    printWindow.document.close();
    printWindow.focus();

    try {
      printWindow.document.title = `Souls In Xtinction TCG - Ronda ${round.roundNumber}`;
      printWindow.history.replaceState(null, "", "/torneos/impresion");
    } catch {
      // Si el navegador no permite cambiar la URL, se mantiene el valor por defecto.
    }

    printWindow.onload = () => {
      printWindow.print();

      // Cierra la ventana solo después de terminar la impresión.
      const handleAfterPrint = () => {
        printWindow.close();
      };

      printWindow.addEventListener("afterprint", handleAfterPrint, {
        once: true,
      });
    };
  };

  return (
    <RoundHistoryCardBase
      round={round}
      players={players}
      status={status}
      matches={isEditing ? editableMatches : round.matches}
      readOnly={!isEditing}
      onChangeResult={isEditing ? handleLocalResultChange : undefined}
      defaultExpanded={isLastRound}
      allowExpand
      expanded={expanded}
      onToggleExpand={setExpanded}
      maxVisibleMatches={4}
      classNames={{
        container:
          "bg-white dark:bg-tournament-dark-surface border border-tournament-dark-accent dark:border-tournament-dark-border",
        title: "text-slate-900 dark:text-white",
        metaText: "text-slate-500 dark:text-slate-400",
        divider: "border-slate-200 dark:border-tournament-dark-border",
        matchDivider: "border-slate-200 dark:border-tournament-dark-border",
        expandButton:
          "border-slate-200 text-slate-600 dark:border-tournament-dark-border dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-tournament-dark-muted",
        showAllButton:
          "text-purple-600 hover:text-purple-600/80 dark:text-purple-600 dark:hover:text-purple-600/80",
      }}
      matchCardClassNames={{
        container: "bg-white dark:bg-tournament-dark-surface",
        tableBadge:
          "bg-slate-100 text-slate-700 dark:bg-tournament-dark-muted dark:text-slate-200",
        tableText: "text-slate-700 dark:text-slate-200",
        byeText: "text-slate-400 dark:text-slate-500",
        byeImage: "border-slate-200 dark:border-tournament-dark-border",
      }}
      headerActions={
        <>
          {canPrintRound && (
            <button
              onClick={handlePrintRound}
              title="Imprimir ronda"
              className="p-1 text-sm rounded border border-slate-200 text-slate-600 transition hover:border-purple-300 hover:text-purple-600 dark:border-tournament-dark-border dark:text-slate-300 dark:hover:text-purple-300"
            >
              <IoPrintOutline />
            </button>
          )}

          {canEditRound && !isEditing && (
            <button
              onClick={handleEdit}
              title="Editar ronda"
              className="p-1 text-sm rounded bg-purple-600 text-white hover:bg-purple-600/90"
            >
              <IoPencil />
            </button>
          )}

          {isEditing && (
            <>
              <button
                onClick={handleSave}
                title="Guardar cambios"
                className="p-1 text-sm rounded bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <IoSave />
              </button>

              <button
                onClick={handleCancel}
                title="Cancelar edicion"
                className="p-1 text-sm rounded bg-rose-600 text-white hover:bg-rose-700"
              >
                <IoClose />
              </button>
            </>
          )}
        </>
      }
    />
  );
};
