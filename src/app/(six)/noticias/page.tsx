import { getPublicNewsAction, getPublicNewsCategoriesAction } from "@/actions";
import type { PublicNewsCard, PublicNewsListItem } from "@/interfaces";
import { NewsCarouselCard } from "@/components/news/public/NewsCarouselCard";
import { PublicNewsExplorer } from "@/components/news/public/PublicNewsExplorer";
import { NewsCarousel } from "@/components/news/public/NewsCarousel";

export const dynamic = "force-dynamic";

const mapToPublicCard = (item: PublicNewsListItem): PublicNewsCard => ({
  id: item.id,
  title: item.title,
  shortSummary: item.shortSummary,
  featuredImage: item.cardImage,
  cardImage: item.cardImage,
  publishedAt: item.publishedAt,
  newCategoryId: item.newCategoryId,
  categoryName: item.categoryName,
});

export default async function NoticiasPage() {
  const [news, categories] = await Promise.all([
    getPublicNewsAction(),
    getPublicNewsCategoriesAction(),
  ]);

  const sortedNews = [...news].sort((a, b) => {
    const dateA = new Date(a.publishedAt ?? a.createdAt).getTime();
    const dateB = new Date(b.publishedAt ?? b.createdAt).getTime();
    return dateB - dateA;
  });

  const heroMain = sortedNews[0] ?? null;
  // Prioriza Lanzamientos > Actualizaciones > Spoilers para la tarjeta secundaria.
  const priorityCategories = ["LANZAMIENTOS", "ACTUALIZACIONES", "SPOILERS"];
  const heroSecondary =
    priorityCategories
      .map((category) =>
        sortedNews.find(
          (item) =>
            (item.categoryName ?? "").toUpperCase() === category &&
            item.id !== heroMain?.id,
        ),
      )
      .find(Boolean) ??
    sortedNews.find((item) => item.id !== heroMain?.id) ??
    null;

  const recentCards = sortedNews.slice(0, 6).map(mapToPublicCard);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto flex min-h-screen flex-col gap-12 px-10 py-12 sm:px-14 lg:px-24 space-y-6 md:space-y-14">
        <section className="flex min-h-[calc(100vh-7.5rem)] md:max-h-[calc(100vh-7.5rem)] flex-col space-y-6 overflow-hidden pb-10">
          <div className="grid min-h-full flex-1 items-stretch gap-6 md:grid-cols-6 md:grid-rows-1 md:px-2">
            {heroMain && (
              <div className="flex h-full md:col-span-4">
                <NewsCarouselCard
                  item={mapToPublicCard(heroMain)}
                  className="h-full"
                  imageClassName="!h-1/2"
                />
              </div>
            )}
            {heroSecondary && (
              <div className="flex h-full md:col-span-2">
                <NewsCarouselCard
                  item={mapToPublicCard(heroSecondary)}
                  className="h-full"
                  imageClassName="!h-1/2"
                />
              </div>
            )}
          </div>
        </section>

        <section className="space-y-4 md:space-y-10 px-3 lg:px-16">
          <h1 className="text-center text-2xl font-extrabold uppercase tracking-[0.2em] text-slate-900 dark:text-white sm:text-3xl">
            Noticias más recientes
          </h1>
          <NewsCarousel items={recentCards} />
        </section>

        <hr className="md:mx-12 border-slate-200 dark:border-tournament-dark-border lg:mx-16" />

        <section className="px-3 lg:px-16 -mt-10">
          <PublicNewsExplorer news={news} categories={categories} />
        </section>
      </div>
    </div>
  );
}
