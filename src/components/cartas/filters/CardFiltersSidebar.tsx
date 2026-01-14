"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { motion } from "framer-motion";
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
import { FilterGroup } from "./FilterGroup";
import { FilterOption } from "./FilterOption";
import {
  FilterKey,
  FilterSelections,
  getDefaultFilters,
  numberOptions,
} from "@/utils/filter-utils";

export const FILTER_PANEL_WIDTH = 320;

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
  onFiltersChange?: (filters: FilterSelections) => void;
  statsRange?: string;
}

const LIMIT_OPTIONS = [{ label: "Legendaria", value: "legendaria" }];

export function CardFiltersSidebar({
  propertiesCards,
  panelOpen,
  onPanelToggle,
  onClosePanel,
  onFiltersChange,
  statsRange,
}: CardFiltersSidebarProps) {
  const [filters, setFilters] = useState<FilterSelections>(getDefaultFilters());
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
          label: item.name,
          value: item.id,
        })),
      },
      {
        key: "keywords" as const,
        label: "Palabras clave",
        icon: <RiHashtag className="text-xl" />,
        options: propertiesCards.keywords.map((item) => ({
          label: item.name,
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
    [propertiesCards]
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
      onFiltersChange?.(filters);
    }
  };

  const handleClear = () => {
    const nextFilters = getDefaultFilters();
    setFilters(nextFilters);
    onFiltersChange?.(nextFilters);
  };

  const handleTextChange = (value: string) => {
    setFilters((prev) => ({ ...prev, text: value }));
  };

  const toggleSection = (key: FilterKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const hasPushedRef = useRef(false);

  useEffect(() => {
    if (!onFiltersChange) return;

    if (!hasPushedRef.current) {
      hasPushedRef.current = true;
      return;
    }

    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const statsRangeText = statsRange ?? "0-0 de 0";

  return (
    <div className="relative z-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative min-w-[250px] max-w-[360px]">
              <div className="relative">
                <IoSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-300" />
                <input
                  type="search"
                  value={filters.text}
                  onChange={(event) => handleTextChange(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Buscar nombre, código o efecto"
                  className="w-full rounded-full border border-slate-300 dark:border-tournament-dark-border bg-white dark:bg-tournament-dark-muted text-slate-700 dark:text-white pl-10 pr-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={onPanelToggle}
              className="flex items-center gap-2 px-4 py-2 border border-purple-400 rounded-full text-sm font-semibold text-purple-600 bg-white dark:bg-tournament-dark-muted dark:text-purple-300 shadow-sm hover:border-purple-600 transition"
            >
              <IoFilterSharp className="w-5 h-5" />
              <span>Filtrar</span>
            </button>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-300 whitespace-nowrap">
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
        className="absolute left-0 top-full mt-3"
        style={{
          width: FILTER_PANEL_WIDTH,
          pointerEvents: panelOpen ? "auto" : "none",
        }}
      >
        <div className="relative rounded-[30px] border border-slate-200 dark:border-tournament-dark-border bg-white dark:bg-tournament-dark-surface shadow-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handleClear}
              className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-purple-600"
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
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filterSections.map((section) => (
              <FilterGroup
                key={section.key}
                label={section.label}
                icon={section.icon}
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
