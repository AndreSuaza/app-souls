"use client";

import { useState, useEffect, useRef } from "react";
import {
  IoChevronDownSharp,
  IoChevronUp,
  IoTrashOutline,
} from "react-icons/io5";
import clsx from "clsx";
import { useAlertConfirmationStore, useTournamentStore } from "@/store";
import { searchUserByNickname_action } from "@/actions";
import { InitialPointsModal } from "./InitialPointsModal";

// Este componente realiza múltiples responsabilidades; si crece más es mejor dividirlo.
export const PlayerList = () => {
  const { tournament, addPlayerByUserId, deletePlayer } = useTournamentStore();
  const players = tournament?.tournamentPlayers ?? [];
  const currentRound = tournament?.currentRoundNumber ?? 0;
  const isFinished = tournament?.status === "finished";

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPlayers, setShowPlayers] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [selectedUserForInitialPoints, setSelectedUserForInitialPoints] =
    useState<any>(null);

  const openAlert = useAlertConfirmationStore((s) => s.openAlertConfirmation);
  const closeAlert = useAlertConfirmationStore((s) => s.closeAlertConfirmation);
  const setAction = useAlertConfirmationStore((s) => s.setAction);

  // debounce de 300ms
  useEffect(() => {
    const timeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      const results = await searchUserByNickname_action(query);

      // filtrar usuarios que ya estan registrados en el torneo
      const filtered = results.filter(
        (u) => !players.some((p) => p.userId === u.id)
      );
      setSuggestions(filtered);

      setLoading(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, players]);

  // detectar click fuera del input o dropdown para cerrar el dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = async (user: any) => {
    setShowDropdown(false);
    setSuggestions([]);
    setQuery("");

    let pointsInitial = 0;

    if (currentRound > 0) {
      setSelectedUserForInitialPoints(user);
      setShowInitialModal(true);
      return;
    }

    await addPlayerByUserId(user.id, user.nickname, 0);
  };

  const handleKeyDown = (e: any) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    }

    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0) {
        handleSelect(suggestions[highlightedIndex]);
      }
    }
  };

  const confirmInitialPoints = async (points: number) => {
    if (!selectedUserForInitialPoints) return;

    await addPlayerByUserId(
      selectedUserForInitialPoints.id,
      selectedUserForInitialPoints.nickname,
      points
    );

    setShowInitialModal(false);
    setSelectedUserForInitialPoints(null);
  };

  const cancelInitialPoints = () => {
    setShowInitialModal(false);
    setSelectedUserForInitialPoints(null);
  };

  return (
    <div className="px-4 py-3 border rounded-md bg-slate-50 border-gray-300 overflow-hidden transition-all">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-center uppercase text-xl font-bold">Jugadores</h2>

        {showPlayers ? (
          <IoChevronUp
            className="p-1 w-8 h-8 rounded-md border cursor-pointer"
            onClick={() => setShowPlayers(false)}
          />
        ) : (
          <IoChevronDownSharp
            className="p-1 w-8 h-8 rounded-md border cursor-pointer"
            onClick={() => setShowPlayers(true)}
          />
        )}
      </div>

      {/* Input con autocompletado */}
      <div
        className={clsx(
          "transition-all duration-300",
          showPlayers ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div ref={containerRef} className="relative mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(true);
            }}
            onKeyDown={handleKeyDown}
            className="border px-2 w-full py-1 rounded pr-8"
            placeholder="Nickname del jugador"
          />

          {/* Botón de limpiar */}
          {query.length > 0 && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute left-0 top-full mt-1 w-full bg-white border rounded shadow-lg z-20 max-h-56 overflow-auto">
              {/* Loading */}
              {loading && (
                <div className="px-3 py-2 text-sm text-gray-500 italic">
                  Buscando...
                </div>
              )}

              {/* Sin resultados */}
              {!loading && suggestions.length === 0 && (
                <div className="px-3 py-2 text-sm text-red-500">
                  No se encontraron jugadores
                </div>
              )}

              {/* Resultados */}
              {!loading &&
                suggestions.length > 0 &&
                suggestions.map((user, index) => (
                  <div
                    key={user.id}
                    className={clsx(
                      "px-3 py-2 cursor-pointer",
                      highlightedIndex === index
                        ? "bg-indigo-200"
                        : "hover:bg-indigo-100"
                    )}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    onClick={() => handleSelect(user)}
                  >
                    {user.nickname}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Lista de jugadores en el torneo */}
        <ul>
          {players.map((p, idx) => (
            <li key={p.id} className="border-b px-2 py-4 font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{idx + 1}</span>
                {p.playerNickname}
                <IoTrashOutline
                  className={clsx(
                    "w-6 h-6",
                    isFinished
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-600 cursor-pointer"
                  )}
                  onClick={() => {
                    if (isFinished) return;

                    setAction(() => () => deletePlayer(p.id));
                    openAlert();
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      </div>

      {showInitialModal && (
        <InitialPointsModal
          user={selectedUserForInitialPoints}
          onConfirm={confirmInitialPoints}
          onCancel={cancelInitialPoints}
        />
      )}
    </div>
  );
};
