"use client";

import { useMemo, useState } from "react";
import { FiRefreshCw } from "react-icons/fi";
import { MatchCard } from "../current-round/MarchCard";
import { RoundProgressBar } from "../current-round/RoundProgressBar";
import { ResultButton } from "../current-round/ResultButton";
import { PublicCurrentRoundTimerModal } from "./PublicCurrentRoundTimerModal";
import { TournamentTimerDisplay } from "./TournamentTimerDisplay";
import {
  type MatchInterface,
  type PublicTournamentDetail,
  type RoundInterface,
  type TournamentPlayerInterface,
} from "@/interfaces";

type Props = {
  tournament: PublicTournamentDetail["tournament"];
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
  onReload?: () => void;
};

export function PublicTournamentCurrentRound({
  tournament,
  players,
  rounds,
  onReload,
}: Props) {
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  const currentRound = useMemo(() => {
    if (rounds.length === 0) return null;
    return rounds[rounds.length - 1];
  }, [rounds]);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="w-full bg-white rounded-xl p-4 shadow-sm border flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Info de la ronda */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center justify-between md:flex-col md:items-start md:gap-2">
            {/* Estado del torneo */}
            <div className="order-2 md:order-1 flex items-center gap-2">
              <span
                className={`w-fit px-3 py-1 rounded-full text-xs font-semibold ${
                  tournament.status === "in_progress"
                    ? "bg-blue-100 text-blue-700"
                    : tournament.status === "finished"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {tournament.status === "in_progress"
                  ? "En progreso"
                  : tournament.status === "finished"
                  ? "Finalizado"
                  : "Pendiente"}
              </span>

              {tournament.status === "in_progress" && onReload && (
                <button
                  type="button"
                  title="Actualizar torneo"
                  onClick={onReload}
                  className="rounded-full p-1 text-gray-500 transition hover:bg-gray-100 hover:text-blue-600"
                >
                  <FiRefreshCw className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Numero de ronda */}
            <h2 className="order-1 md:order-2 text-xl font-bold">
              Ronda {currentRound?.roundNumber ?? tournament.currentRoundNumber}
              {tournament.maxRounds > 1 && ` de ${tournament.maxRounds}`}
            </h2>
          </div>

          <RoundProgressBar round={currentRound ?? undefined} />
        </div>

        {/* Timer */}
        <div className="flex gap-2 lg:gap-3 flex-row items-center justify-between md:justify-normal">
          <button
            type="button"
            onClick={() => setIsTimerModalOpen(true)}
            className="rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            aria-label="Abrir temporizador"
            title="Abrir temporizador"
          >
            <TournamentTimerDisplay
              roundId={currentRound?.id ?? null}
              startedAt={currentRound?.startedAt ?? null}
              status={tournament.status}
            />
          </button>
        </div>
      </div>

      <PublicCurrentRoundTimerModal
        open={isTimerModalOpen}
        onClose={() => setIsTimerModalOpen(false)}
        tournament={tournament}
        currentRound={currentRound}
      />

      {!currentRound ? (
        <div className="bg-white border rounded-md p-6 text-gray-400 text-center">
          Aun no se ha generado la ronda
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Emparejamientos</h3>

          <div className="hidden md:grid grid-cols-[72px_1fr_220px_1fr_72px] text-xs font-semibold text-gray-500 px-4">
            <span className="text-left">Mesa</span>
            <span className="text-left">Jugador 1</span>
            <span className="text-center">Resultado</span>
            <span className="text-right">Jugador 2</span>
            <span className="text-right">Estado</span>
          </div>

          <div className="flex flex-col gap-3">
            {currentRound.matches.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                tableNumber={index + 1}
                players={players}
                readOnly
                renderResult={renderResultButtons}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
