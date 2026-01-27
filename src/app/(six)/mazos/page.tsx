import { auth } from '@/auth';
import { getDeckFiltersAction, getDecksFilteredAction } from '@/actions';
import { DeckCard, DeckFiltersBar } from '@/components';
import { noStore } from 'next/cache';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title:
    'Biblioteca de Mazos | La biblioteca donde nacen y evolucionan los mejores mazos de Souls In Xtinction TCG',
  description: 'Explora, comparte y descubre mazos creados por la comunidad',
  openGraph: {
    title:
      'Biblioteca de Mazos | La biblioteca donde nacen y evolucionan los mejores mazos de Souls In Xtinction TCG',
    description: 'Explora, comparte y descubre mazos creados por la comunidad',
    url: 'https://soulsinxtinction.com/mazos',
    siteName: 'Biblioteca de Mazos Souls In Xtinction TCG',
    images: [
      {
        url: 'https://soulsinxtinction.com/souls-in-xtinction.webp',
        width: 800,
        height: 600,
        alt: 'Souls In Xtinction TCG',
      },
    ],
    locale: 'en_ES',
    type: 'website',
  },
};

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

const getParam = (
  value: string | string[] | undefined,
): string | undefined => {
  return Array.isArray(value) ? value[0] : value;
};

export default async function Page({ searchParams }: PageProps) {
  // Forzamos lectura fresca de la DB para evitar cache en produccion.
  noStore();

  const tournament = getParam(searchParams?.tournament);
  const archetypeId = getParam(searchParams?.archetype);
  const date = getParam(searchParams?.date);
  const likes = getParam(searchParams?.likes);

  const [decks, filters, session] = await Promise.all([
    getDecksFilteredAction({
      tournament,
      archetypeId,
      date,
      likes,
    }),
    getDeckFiltersAction(),
    auth(),
  ]);

  const hasSession = Boolean(session?.user);

  return (
    <main className="px-4 pb-12 pt-6 sm:px-6 lg:px-10">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-wide text-slate-900 dark:text-white sm:text-3xl">
            Biblioteca de mazos
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Explora, comparte y descubre mazos creados por la comunidad.
          </p>
        </header>

        <DeckFiltersBar archetypes={filters.archetypes} />

        <section>
          {decks.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface/70 dark:text-slate-300">
              No hay mazos que coincidan con los filtros actuales.
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {decks.map((deck) => (
                <li key={deck.id} className="h-full">
                  <DeckCard mazo={deck} hasSession={hasSession} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
