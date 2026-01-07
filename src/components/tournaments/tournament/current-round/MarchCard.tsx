"use client";

import clsx from "clsx";
import Image from "next/image";
import { ReactNode } from "react";
import { MatchInterface, TournamentPlayerInterface } from "@/interfaces";
import { PlayerCell } from "../players/PlayerCell";
import { MatchResultSelector } from "./MatchResultSelector";
import { MatchStatusIcon } from "./MatchStatusIcon";

interface MatchCardProps {
  match: MatchInterface;
  tableNumber: number;
  players: TournamentPlayerInterface[];
  readOnly?: boolean; // indica si el resultado es editable
  decorated?: boolean; // controla borde, sombra y redondeo
  onChangeResult?: (matchId: string, result: "P1" | "P2" | "DRAW") => void;
  renderResult?: (match: MatchInterface) => ReactNode;
  classNames?: {
    container?: string;
    tableBadge?: string;
    tableText?: string;
    byeText?: string;
    byeImage?: string;
  };
}

export const MatchCard = ({
  match,
  tableNumber,
  players,
  readOnly = false, // por defecto editable
  decorated = true, // ← por defecto con estilos visuales
  onChangeResult,
  renderResult,
  classNames,
}: MatchCardProps) => {
  const player1 = players.find((p) => p.id === match.player1Id);
  const player2 = players.find((p) => p.id === match.player2Id);

  if (!player1) return null;

  const p1Highlight =
    match.result === "P1"
      ? "blue"
      : match.result === "DRAW"
      ? "yellow"
      : undefined;
  const p2Highlight =
    match.result === "P2"
      ? "red"
      : match.result === "DRAW"
      ? "yellow"
      : undefined;

  return (
    <div
      className={clsx(
        "grid gap-y-3 md:grid-cols-[72px_1fr_220px_1fr_72px] md:grid-rows-1 md:gap-y-0 items-center px-2 py-4 md:p-4 w-full",
        classNames?.container ?? "bg-white",
        {
          "border rounded-xl shadow-sm": decorated,
        }
      )}
    >
      {/* Mesa */}
      <div className="flex items-center gap-2 justify-center md:col-auto md:row-auto md:justify-start">
        {/* Desktop */}
        <span
          className={clsx(
            "hidden md:flex w-8 h-8 items-center justify-center rounded-full font-semibold",
            classNames?.tableBadge ?? "bg-gray-100"
          )}
        >
          {tableNumber}
        </span>

        {/* Mobile */}
        <span
          className={clsx(
            "md:hidden text-sm font-semibold",
            classNames?.tableText ?? "text-gray-700"
          )}
        >
          Mesa {tableNumber}
        </span>

        {/* Estado - Solo mobile */}
        <div className="md:hidden">
          <MatchStatusIcon resolved={match.result !== null} />
        </div>
      </div>

      {/* Mobile */}
      <div className="grid md:hidden w-full grid-cols-[1fr_auto_1fr] items-center">
        {/* Jugador 1 */}
        <div className="flex justify-start overflow-hidden">
          <PlayerCell player={player1} highlight={p1Highlight} />
        </div>

        {/* VS */}
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-6 text-center">
          VS
        </span>

        {/* Jugador 2 */}
        <div className="flex justify-end overflow-hidden">
          {player2 ? (
            <PlayerCell player={player2} reverse highlight={p2Highlight} />
          ) : (
            <div className="flex items-center gap-3 justify-end text-right">
              <p
                className={clsx(
                  "font-semibold",
                  classNames?.byeText ?? "text-gray-400"
                )}
              >
                BYE
              </p>
              <Image
                src="/profile/player.webp"
                alt="BYE"
                width={36}
                height={36}
                className={clsx(
                  "w-9 h-9 rounded-full object-cover border",
                  classNames?.byeImage ?? "border-gray-200"
                )}
              />
            </div>
          )}
        </div>
      </div>

      {/* Jugador 1 */}
      <div className="hidden md:flex justify-start md:col-auto md:row-auto">
        <PlayerCell player={player1} highlight={p1Highlight} />
      </div>

      {/* Resultado */}
      <div className="flex justify-center md:col-auto md:row-auto">
        {renderResult ? (
          renderResult(match)
        ) : (
          <MatchResultSelector
            match={match}
            layout="mobileGrid"
            readOnly={readOnly || !player2}
            onChangeResult={
              onChangeResult
                ? (result) => onChangeResult(match.id, result)
                : undefined
            }
          />
        )}
      </div>

      {/* Jugador 2 (nickname/nombre a la derecha + avatar a la derecha) */}
      <div className="hidden md:flex justify-end md:col-auto md:row-auto">
        {player2 ? (
          <PlayerCell player={player2} reverse highlight={p2Highlight} />
        ) : (
          <div className="flex items-center gap-3 justify-end text-right">
            {/* Texto BYE */}
            <div className="leading-tight">
              <p
                className={clsx(
                  "font-semibold",
                  classNames?.byeText ?? "text-gray-400"
                )}
              >
                BYE
              </p>
            </div>

            {/* Avatar por defecto */}
            <Image
              src="/profile/player.webp"
              alt="BYE"
              width={36}
              height={36}
              className={clsx(
                "w-9 h-9 rounded-full object-cover border",
                classNames?.byeImage ?? "border-gray-200"
              )}
            />
          </div>
        )}
      </div>

      {/* Estado */}
      <div className="hidden md:flex justify-end">
        <MatchStatusIcon resolved={match.result !== null} />
      </div>
    </div>
  );
};
