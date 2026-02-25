import { getPublicNewsAction, getPublicNewsCategoriesAction } from "@/actions";
import type { PublicNewsCard, PublicNewsListItem } from "@/interfaces";
import { NewsCarouselCard } from "@/components/news/public/NewsCarouselCard";
import { NewsHeroCard } from "@/components/news/public/NewsHeroCard";
import { PublicNewsExplorer } from "@/components/news/public/PublicNewsExplorer";

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

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto flex min-h-screen flex-col space-y-6 px-6 py-12 sm:px-8 lg:px-16 md:space-y-14">
        <section className="flex min-h-[calc(100vh-7.5rem)] md:max-h-[calc(100vh-7.5rem)] flex-col space-y-6 overflow-hidden pb-10">
          <div className="grid min-h-full flex-1 items-stretch gap-6 md:grid-cols-6 md:grid-rows-1 md:px-2">
            {heroMain && (
              <div className="flex h-full md:col-span-4">
                <NewsHeroCard item={mapToPublicCard(heroMain)} />
              </div>
            )}
            {heroSecondary && (
              <div className="flex h-full md:col-span-2">
                <NewsCarouselCard
                  item={mapToPublicCard(heroSecondary)}
                  className="h-full"
                />
              </div>
            )}
          </div>
        </section>

        <section>
          <PublicNewsExplorer news={news} categories={categories} />
        </section>
      </div>
    </div>
  );
}
