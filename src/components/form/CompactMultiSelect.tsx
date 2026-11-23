"use client";

import { useEffect, useRef, useState } from "react";
import { IoCheckmarkOutline, IoChevronDownOutline, IoCloseOutline } from "react-icons/io5";

type CompactMultiSelectOption = {
  id: string;
  name: string;
};

type CompactMultiSelectProps = {
  label: string;
  value: string[];
  options: CompactMultiSelectOption[];
  required?: boolean;
  placeholder?: string;
  error?: string;
  onChange: (value: string[]) => void;
};

export const CompactMultiSelect = ({
  label,
  value,
  options,
  required = false,
  placeholder = "Selecciona una o más opciones",
  error,
  onChange,
}: CompactMultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedOptions = options.filter((option) => value.includes(option.id));

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const toggleOption = (optionId: string) => {
    onChange(
      value.includes(optionId)
        ? value.filter((id) => id !== optionId)
        : [...value, optionId],
    );
  };

  const clearSelection = () => onChange([]);

  return (
    <div ref={containerRef} className="relative">
      <span
        className={`mb-1 block text-sm font-semibold ${
          error ? "text-red-600 dark:text-red-400" : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-purple-500">
            *
          </span>
        )}
      </span>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        onClick={() => setIsOpen((current) => !current)}
        className={`flex min-h-[42px] w-full items-center justify-between gap-3 rounded-lg border bg-white px-3 py-2 text-left text-sm text-slate-700 outline-none transition dark:bg-tournament-dark-muted dark:text-slate-200 ${
          error
            ? "!border-red-500 hover:!border-red-500 focus:!border-red-500 focus:!ring-red-500/30"
            : "border-tournament-dark-accent hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 dark:border-tournament-dark-border"
        }`}
      >
        <span className="min-w-0 truncate">
          {selectedOptions.length === 0
            ? placeholder
            : selectedOptions.length === 1
              ? selectedOptions[0].name
              : `${selectedOptions.length} opciones seleccionadas`}
        </span>
        <IoChevronDownOutline
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      {required && (
        <input
          aria-hidden="true"
          tabIndex={-1}
          required
          value={value.length > 0 ? "selected" : ""}
          onChange={() => undefined}
          className="pointer-events-none absolute h-px w-px opacity-0"
        />
      )}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      {isOpen && (
        <div
          role="listbox"
          aria-label={label}
          aria-multiselectable="true"
          className="absolute left-0 right-0 top-full z-40 mt-1 max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-tournament-dark-border dark:bg-tournament-dark-surface"
        >
          {selectedOptions.length > 0 && (
            <button
              type="button"
              onClick={clearSelection}
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:text-purple-300 dark:hover:bg-purple-500/10"
            >
              Limpiar selección
              <IoCloseOutline aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
          {options.map((option) => {
            const isSelected = value.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => toggleOption(option.id)}
                className="flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-tournament-dark-muted"
              >
                <span>{option.name}</span>
                {isSelected && (
                  <IoCheckmarkOutline
                    aria-hidden="true"
                    className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-300"
                  />
                )}
              </button>
            );
          })}
          {options.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500">Sin opciones disponibles</p>
          )}
        </div>
      )}
    </div>
  );
};
