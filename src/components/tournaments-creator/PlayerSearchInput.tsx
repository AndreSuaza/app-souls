"use client";

import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { searchUsersAction } from "@/actions";
import { UserSummaryInterface } from "@/interfaces";

export type PlayerSearchInputProps = {
  existingPlayersIds: string[]; // IDs de jugadores ya inscritos
  onSelectUser: (user: UserSummaryInterface) => void;
};

export const PlayerSearchInput = ({
  existingPlayersIds,
  onSelectUser,
}: PlayerSearchInputProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState<UserSummaryInterface[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce para búsqueda 300ms
  useEffect(() => {
    const timeout = setTimeout(() => {
      runSearch(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, existingPlayersIds]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cuando se selecciona un usuario
  function handleSelect(user: { id: string; nickname: string }) {
    onSelectUser(user);
    setSuggestions([]);
    setShowDropdown(false);
  }

  // Navegación con flechas
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
  }

  const runSearch = async (value: string) => {
    const search = value.trim();
    if (search.length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setLoading(true);

    const results = await searchUsersAction({ search });

    const filtered = results.filter((u) => !existingPlayersIds.includes(u.id));

    setSuggestions(filtered);
    setLoading(false);
    setShowDropdown(true);
  };

  return (
    <div ref={containerRef} className="relative mb-4">
      {/* Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        className="border px-2 w-full py-1 rounded pr-8"
        placeholder="Escribe el nombre o nickname"
        onFocus={() => {
          if (query.trim().length > 0) {
            runSearch(query);
          }
        }}
      />

      {/* Botón limpiar */}
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

          {/* No results */}
          {!loading && suggestions.length === 0 && (
            <div className="px-3 py-2 text-sm text-red-500">
              No se encontraron jugadores
            </div>
          )}

          {/* Results */}
          {!loading &&
            suggestions.length > 0 &&
            suggestions.map((user, index) => (
              <div
                key={user.id}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(user)}
                className={clsx(
                  "px-3 py-2 cursor-pointer",
                  highlightedIndex === index
                    ? "bg-indigo-200"
                    : "hover:bg-indigo-100"
                )}
              >
                <p className="font-semibold">{user.nickname}</p>

                {(user.name || user.lastname) && (
                  <p className="text-xs text-gray-500">
                    {[user.name, user.lastname].filter(Boolean).join(" ")}
                  </p>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};
