'use client';

import clsx from 'clsx';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

interface ArchetypeOption {
  id: string;
  name: string | null;
}

interface Props {
  archetypes: ArchetypeOption[];
}

const tournamentOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'with', label: 'Con torneo' },
  { value: 'without', label: 'Sin torneo' },
] as const;

const dateOptions = [
  { value: 'recent', label: 'Mas recientes' },
  { value: 'old', label: 'Mas antiguos' },
] as const;

export function DeckFiltersBar({ archetypes }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // La URL es la fuente de verdad para los filtros, igual que en /cartas.
  const currentTournament = searchParams.get('tournament') ?? 'all';
  const currentDate = searchParams.get('date') ?? 'recent';
  const currentArchetype = searchParams.get('archetype') ?? '';
  const hasLikesFilter = searchParams.get('likes') === '1';

  const archetypeOptions = useMemo(
    () =>
      archetypes
        .filter((item) => Boolean(item.name))
        .map((item) => ({
          id: item.id,
          name: item.name as string,
        })),
    [archetypes],
  );

  const updateParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (!value || value === 'all') {
          params.delete(key);
          return;
        }
        params.set(key, value);
      });

      const query = params.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;
      router.replace(nextUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const resetFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    ['tournament', 'archetype', 'date', 'likes'].forEach((key) =>
      params.delete(key),
    );
    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams]);

  const filterButtonClass =
    'flex h-9 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors';

  return (
    <section className="rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface/80">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          Filtros de mazos
        </div>
        <button
          type="button"
          onClick={resetFilters}
          className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:border-purple-400 hover:text-purple-600 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-200"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-[auto_auto_1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          {tournamentOptions.map((option) => {
            const isActive = currentTournament === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateParams({ tournament: option.value })}
                className={clsx(
                  filterButtonClass,
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-accent dark:hover:text-white',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-2">
          {dateOptions.map((option) => {
            const isActive = currentDate === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => updateParams({ date: option.value })}
                className={clsx(
                  filterButtonClass,
                  isActive
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-accent dark:hover:text-white',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <label className="flex w-full flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Arquetipo
          </span>
          <select
            value={currentArchetype}
            onChange={(event) =>
              updateParams({
                archetype: event.target.value || undefined,
              })
            }
            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-purple-500 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-100"
          >
            <option value="">Todos los arquetipos</option>
            {archetypeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={() => updateParams({ likes: hasLikesFilter ? undefined : '1' })}
          className={clsx(
            filterButtonClass,
            hasLikesFilter
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-tournament-dark-border dark:text-slate-300 dark:hover:bg-tournament-dark-accent dark:hover:text-white',
          )}
        >
          Con likes
        </button>
      </div>
    </section>
  );
}
