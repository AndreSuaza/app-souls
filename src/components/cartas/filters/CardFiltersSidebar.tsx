"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
import clsx from "clsx";
import { IoFilterSharp, IoCloseOutline, IoSearch } from "react-icons/io5";
import { RiShoppingBagLine, RiHashtag } from "react-icons/ri";
import {
  GiTreasureMap,
  GiSpellBook,
  GiCash,
  GiMuscleUp,
  GiShield,
  GiStarFormation,
  GiCardPick,
} from "react-icons/gi";
import { FilterSelections } from "@/interfaces";
import { FilterGroup } from "./FilterGroup";
import { FilterOption } from "./FilterOption";
import {
  FilterKey,
  getDefaultFilters,
  numberOptions,
} from "@/utils/filter-utils";

export const FILTER_PANEL_WIDTH = 320;
// Ancho minimo estimado para mantener el buscador y el boton en una sola fila.
const SEARCH_CONTROLS_MIN_WIDTH = 520;
// Histeresis para evitar alternancias constantes cerca del umbral.
const SEARCH_CONTROLS_RELEASE_WIDTH = SEARCH_CONTROLS_MIN_WIDTH + 24;

interface Properties {
  products: { id: string; name: string }[];
  types: { id: string; name: string }[];
  archetypes: { id: string; name: string }[];
  keywords: { id: string; name: string }[];
  rarities: { id: string; name: string }[];
}

interface CardFiltersSidebarProps {
  propertiesCards: Properties;
  panelOpen: boolean;
  onPanelToggle: () => void;
  onClosePanel: () => void;
  initialFilters?: FilterSelections;
  onFiltersChange?: (filters: FilterSelections) => void;
  statsRange?: string;
  forceDesktopLayout?: boolean;
  onCompactSearchLayoutChange?: (isCompact: boolean) => void;
  stackPanelLayout?: boolean;
}

const LIMIT_OPTIONS = [{ label: "Legendaria", value: "legendaria" }];
const FILTER_SELECTION_KEYS: FilterKey[] = [
  "products",
  "types",
  "archetypes",
  "keywords",
  "rarities",
  "cost",
  "force",
  "defense",
  "limit",
];

const areArraysEqual = (left: string[], right: string[]) =>
  left.length === right.length &&
  left.every((value, index) => value === right[index]);

export function CardFiltersSidebar({
  propertiesCards,
  panelOpen,
  onPanelToggle,
  onClosePanel,
  initialFilters,
  onFiltersChange,
  statsRange,
  forceDesktopLayout = false,
  onCompactSearchLayoutChange,
  stackPanelLayout = false,
}: CardFiltersSidebarProps) {
  const [filters, setFilters] = useState<FilterSelections>(
    () => initialFilters ?? getDefaultFilters(),
  );
  const [expanded, setExpanded] = useState<Record<FilterKey, boolean>>({
    products: false,
    types: false,
    archetypes: false,
    keywords: false,
    rarities: false,
    cost: false,
    force: false,
    defense: false,
    limit: false,
  });
  // Evita disparar la busqueda cuando el estado se sincroniza desde la URL.
  const skipNextChangeRef = useRef(false);
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousFiltersRef = useRef<FilterSelections>(filters);
  const searchControlsRef = useRef<HTMLDivElement | null>(null);
  const [isCompactSearchLayout, setIsCompactSearchLayout] = useState(false);

  const filterSections = useMemo(
    () => [
      {
        key: "products" as const,
        label: "Productos",
        icon: <RiShoppingBagLine className="text-xl" />,
        options: propertiesCards.products.map((item) => ({
          label: `${item.name}`,
          value: item.id,
        })),
      },
      {
        key: "types" as const,
        label: "Tipo",
        icon: <GiCardPick className="text-xl" />,
        options: propertiesCards.types.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      },
      {
        key: "archetypes" as const,
        label: "Arquetipo",
        icon: <GiSpellBook className="text-xl" />,
        options: propertiesCards.archetypes.map((item) => ({
          label: item.name?.trim() ? item.name : "Sin arquetipo",
          value: item.id,
        })),
      },
      {
        key: "keywords" as const,
        label: "Palabras clave",
        icon: <RiHashtag className="text-xl" />,
        options: propertiesCards.keywords
          .filter((item) => item.name?.trim())
          .map((item) => ({
            label: item.name.trim(),
            value: item.id,
          })),
      },
      {
        key: "rarities" as const,
        label: "Rarezas",
        icon: <GiTreasureMap className="text-xl" />,
        options: propertiesCards.rarities.map((item) => ({
          label: item.name,
          value: item.id,
        })),
      },
      {
        key: "cost" as const,
        label: "Costo",
        icon: <GiCash className="text-xl" />,
        options: numberOptions.map((value) => ({ label: value, value })),
      },
      {
        key: "force" as const,
        label: "Fuerza",
        icon: <GiMuscleUp className="text-xl" />,
        options: numberOptions.map((value) => ({ label: value, value })),
      },
      {
        key: "defense" as const,
        label: "Defensa",
        icon: <GiShield className="text-xl" />,
        options: numberOptions.map((value) => ({ label: value, value })),
      },
      {
        key: "limit" as const,
        label: "Legendarias",
        icon: <GiStarFormation className="text-xl" />,
        options: LIMIT_OPTIONS,
      },
    ],
    [propertiesCards],
  );

  const handleToggleSelection = (key: FilterKey, value: string) => {
    setFilters((prev) => {
      const isSelected = prev[key].includes(value);
      const nextValues = isSelected
        ? prev[key].filter((item) => item !== value)
        : [...prev[key], value];

      return { ...prev, [key]: nextValues } as FilterSelections;
    });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      onFiltersChange?.(filters);
    }
  };

  const handleClear = () => {
    const nextFilters = getDefaultFilters();
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }
    skipNextChangeRef.current = true;
    setFilters(nextFilters);
    onFiltersChange?.(nextFilters);
  };

  const handleTextChange = (value: string) => {
    setFilters((prev) => ({ ...prev, text: value }));
  };

  const toggleSection = (key: FilterKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasNonTextChange = (
    previous: FilterSelections,
    next: FilterSelections,
  ) =>
    FILTER_SELECTION_KEYS.some(
      (key) => !areArraysEqual(previous[key], next[key]),
    );

  const hasPushedRef = useRef(false);

  useEffect(() => {
    if (!initialFilters) return;
    setFilters((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(initialFilters)) {
        return prev;
      }
      skipNextChangeRef.current = true;
      return initialFilters;
    });
  }, [initialFilters]);

  useEffect(() => {
    if (!onFiltersChange) return;

    if (!hasPushedRef.current) {
      hasPushedRef.current = true;
      previousFiltersRef.current = filters;
      return;
    }

    if (skipNextChangeRef.current) {
      skipNextChangeRef.current = false;
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
        debounceTimeoutRef.current = null;
      }
      previousFiltersRef.current = filters;
      return;
    }

    const previousFilters = previousFiltersRef.current;
    const textChanged = previousFilters.text !== filters.text;
    const otherChanged = hasNonTextChange(previousFilters, filters);

    if (textChanged && !otherChanged) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      // Aplica debounce solo al texto para evitar consultas por cada tecla.
      debounceTimeoutRef.current = setTimeout(() => {
        onFiltersChange(filters);
      }, 300);
      previousFiltersRef.current = filters;
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = null;
    }

    onFiltersChange(filters);
    previousFiltersRef.current = filters;
  }, [filters, onFiltersChange]);

  useEffect(() => {
    const shouldMeasureSearchLayout = forceDesktopLayout || stackPanelLayout;

    if (!shouldMeasureSearchLayout) {
      setIsCompactSearchLayout(false);
      return;
    }

    const element = searchControlsRef.current;
    if (!element) return;

    const updateLayout = (width: number) => {
      setIsCompactSearchLayout((prev) => {
        if (prev) {
          return width < SEARCH_CONTROLS_RELEASE_WIDTH;
        }
        return width < SEARCH_CONTROLS_MIN_WIDTH;
      });
    };

    updateLayout(element.getBoundingClientRect().width);

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        updateLayout(entry.contentRect.width);
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [forceDesktopLayout, stackPanelLayout]);

  useEffect(() => {
    onCompactSearchLayoutChange?.(isCompactSearchLayout);
  }, [isCompactSearchLayout, onCompactSearchLayoutChange]);

  const statsRangeText = statsRange ?? "0-0 de 0";
  const shouldStackPanel = Boolean(stackPanelLayout);
  // Fuerza el layout tipo escritorio cuando se requiere mantener el comportamiento lg.
  const panelLayoutClassName = shouldStackPanel
    ? "mt-3 w-full"
    : forceDesktopLayout && isCompactSearchLayout
      ? "absolute left-0 top-full mt-3 w-full"
      : "absolute left-0 top-full mt-3 w-[320px]";
  const panelVisibilityClassName = shouldStackPanel
    ? panelOpen
      ? "block"
      : "hidden"
    : forceDesktopLayout
      ? "block"
      : panelOpen
        ? "block"
        : "hidden md:block";
  // Ajusta el layout cuando no cabe el buscador con el boton en una sola fila.
  const searchRowClassName = isCompactSearchLayout
    ? "flex w-full flex-col items-stretch gap-2"
    : "flex items-center gap-3";
  const searchInputWrapperClassName = isCompactSearchLayout
    ? "relative w-full"
    : "relative min-w-[250px] sm:min-w-[260px] max-w-[360px]";

  return (
    <div className="relative z-10">
      <div className="flex flex-col gap-3">
        <div
          ref={searchControlsRef}
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className={searchRowClassName}>
            <div className={searchInputWrapperClassName}>
              <div className="relative">
                <IoSearch className="absolute left-1 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-300" />
                <input
                  type="search"
                  value={filters.text}
                  onChange={(event) => handleTextChange(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder={
                    isCompactSearchLayout
                      ? "Buscar..."
                      : "Buscar nombre, código o efecto"
                  }
                  className="w-full rounded-lg border border-slate-300 dark:border-tournament-dark-border bg-white dark:bg-tournament-dark-muted text-slate-700 dark:text-white pl-6 sm:pl-8 pr-0 sm:pr-3 py-2 text-xs sm:text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onPanelToggle}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 border border-purple-400 rounded-lg font-semibold text-purple-600 bg-white dark:bg-tournament-dark-muted dark:text-purple-300 shadow-sm hover:border-purple-600 transition",
                isCompactSearchLayout
                  ? "w-full justify-center text-xs"
                  : "text-sm",
              )}
            >
              <IoFilterSharp
                className={isCompactSearchLayout ? "w-4 h-4" : "w-5 h-5"}
              />
              <span>Filtrar</span>
            </button>
          </div>
          <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
            Mostrando{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {statsRangeText}
            </span>{" "}
            cartas:
          </div>
        </div>
        <hr className="border-slate-200 dark:border-tournament-dark-border" />
      </div>

      <motion.aside
        aria-hidden={!panelOpen}
        initial={{ opacity: 0, x: -20 }}
        animate={panelOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className={clsx(panelLayoutClassName, panelVisibilityClassName)}
        style={{
          pointerEvents: panelOpen ? "auto" : "none",
        }}
      >
        <div className="relative rounded-lg border border-slate-200 dark:border-tournament-dark-border bg-white dark:bg-tournament-dark-surface shadow-2xl p-2 sm:p-6">
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white  px-2 sm:px-4 py-2 text-xs font-semibold text-slate-700 transition dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200 hover:border-purple-400"
            >
              Borrar filtros
            </button>
            <button
              type="button"
              onClick={onClosePanel}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-300"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 sm:max-h-[420px] overflow-y-auto pr-1">
            {filterSections.map((section) => (
              <FilterGroup
                key={section.key}
                label={section.label}
                icon={section.icon}
                hasSelection={filters[section.key].length > 0}
                expanded={expanded[section.key]}
                onToggle={() => toggleSection(section.key)}
              >
                {section.options.map((option) => (
                  <FilterOption
                    key={`${section.key}-${option.value}`}
                    label={option.label}
                    active={filters[section.key].includes(option.value)}
                    onClick={() =>
                      handleToggleSelection(section.key, option.value)
                    }
                  />
                ))}
              </FilterGroup>
            ))}
          </div>
        </div>
      </motion.aside>
    </div>
  );
}
