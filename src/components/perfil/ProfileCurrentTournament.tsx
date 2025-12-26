"use client";

import { useMemo } from "react";
import { ActiveTournamentData, MatchInterface } from "@/interfaces";
import { MatchCard } from "../tournaments/tournament/current-round/MarchCard";
import { RoundHistoryCardBase } from "../tournaments/tournament/hisotry/RoundHistoryCardBase";
import { ResultButton } from "../tournaments/tournament/current-round/ResultButton";

type Props = {
  data: ActiveTournamentData;
};

export const ProfileCurrentTournament = ({ data }: Props) => {
  const { tournament, players, rounds, currentUserId } = data;

  const orderedRounds = useMemo(
    () => [...rounds].sort((a, b) => a.roundNumber - b.roundNumber),
    [rounds]
  );

  const currentRound = orderedRounds[orderedRounds.length - 1];
  const currentPlayer = players.find(
    (player) => player.userId === currentUserId
  );

  // Ubica el match del usuario en la ronda actual para mostrarlo primero.
  const currentMatchIndex = currentRound
    ? currentRound.matches.findIndex(
        (match) =>
          match.player1Id === currentPlayer?.id ||
          match.player2Id === currentPlayer?.id
      )
    : -1;

  const currentMatch =
    currentRound && currentMatchIndex >= 0
      ? currentRound.matches[currentMatchIndex]
      : null;

  // Ordena rondas con la actual primero (si existe), luego el resto en descendente.
  const historyRounds = useMemo(() => {
    if (rounds.length === 0) return [];

    const currentRoundNumber =
      tournament.status === "finished"
        ? tournament.currentRoundNumber
        : tournament.currentRoundNumber + 1;

    return [...rounds].sort((a, b) => {
      if (a.roundNumber === currentRoundNumber) return -1;
      if (b.roundNumber === currentRoundNumber) return 1;
      return b.roundNumber - a.roundNumber;
    });
  }, [rounds, tournament]);

  // Render reutilizable de resultados en modo solo lectura.
  const renderResultButtons = (match: MatchInterface) => (
    <div className="grid grid-cols-3 gap-2 w-full md:flex md:items-center md:justify-center">
      <div className="flex justify-end">
        <ResultButton
          label="Victoria"
          variant="p1"
          active={match.result === "P1"}
          readOnly
          onClick={() => {}}
        />
      </div>

      <div className="flex justify-center">
        <ResultButton
          label="Empate"
          variant="draw"
          active={match.result === "DRAW"}
          readOnly
          onClick={() => {}}
        />
      </div>

      <div className="flex justify-start">
        <ResultButton
          label="Victoria"
          variant="p2"
          active={match.result === "P2"}
          readOnly
          onClick={() => {}}
        />
      </div>
    </div>
  );

  // Tema oscuro alineado con el estilo del admin.
  const matchCardClassNames = {
    container: "bg-gray-800/60 text-gray-200 border-gray-700/50",
    tableBadge: "bg-gray-700/70 text-gray-200",
    tableText: "text-gray-200",
    byeText: "text-gray-300",
    byeImage: "border-gray-700/50",
  };

  const historyCardClassNames = {
    container: "border-gray-700/50 bg-gray-800/60 text-gray-200",
    header: "text-gray-200",
    title: "text-gray-200",
    metaText: "text-gray-400",
    divider: "border-gray-700/50",
    tableHeader: "bg-gray-800/60",
    tableHeaderText: "text-gray-400",
    matchDivider: "border-gray-700/50",
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-200">
          {tournament.title}
        </h3>

        {currentRound && currentMatch ? (
          <MatchCard
            match={currentMatch}
            tableNumber={currentMatchIndex + 1}
            players={players}
            readOnly
            decorated
            classNames={matchCardClassNames}
            renderResult={(match) => renderResultButtons(match)}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/70 p-6 text-sm text-gray-400">
            {currentRound
              ? "Aun no tienes un match asignado en la ronda actual."
              : "Aun no se ha generado la ronda actual."}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-200">
          Historial de rondas
        </h3>

        {historyRounds.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-700 bg-gray-900/70 p-6 text-sm text-gray-400">
            Aun no se han generado rondas.
          </div>
        ) : (
          <div className="space-y-4">
            {historyRounds.map((round) => {
              const isCurrentRound =
                tournament.status === "in_progress" &&
                round.roundNumber === tournament.currentRoundNumber + 1;

              const status = isCurrentRound ? "IN_PROGRESS" : "FINISHED";

              return (
                <RoundHistoryCardBase
                  key={round.id}
                  round={round}
                  players={players}
                  status={status}
                  matches={round.matches}
                  readOnly
                  allowExpand={false}
                  classNames={historyCardClassNames}
                  matchCardClassNames={matchCardClassNames}
                  renderResult={(match) => renderResultButtons(match)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
