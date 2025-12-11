"use client";

import { useMemo } from "react";
import { TournamentPlayerInterface } from "@/interfaces";

export const StandingsTable = ({
  players,
}: {
  players: TournamentPlayerInterface[];
}) => {
  const standings = useMemo(() => {
    return [...players].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.buchholz - a.buchholz;
    });
  }, [players]);

  if (players.length === 0) return null;

  return (
    <div className="p-4 border rounded-md bg-slate-50 border-gray-300 min-h-[600px]">
      <h2 className="text-xl text-center font-bold uppercase mb-2">
        Tabla de Posiciones
      </h2>

      <table className="w-full table-auto border">
        <thead>
          <tr>
            <th className="border px-2 py-1">#</th>
            <th className="border px-2 py-1">Jugador</th>
            <th className="border px-2 py-1">Puntos</th>
            <th className="border px-2 py-1">DE</th>
          </tr>
        </thead>

        <tbody>
          {standings.map((player, i) => (
            <tr key={player.id} className="text-center">
              <td className="border px-2 py-1">{i + 1}</td>
              <td className="border px-2 py-1">{player.playerNickname}</td>
              <td className="border px-2 py-1">{player.points}</td>
              <td className="border px-2 py-1">{player.buchholz}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
