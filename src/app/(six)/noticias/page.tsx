
import { getPublicNewsAction, getPublicNewsCategoriesAction } from "@/actions";
import { AdminNewsList } from "@/components/news/admin/AdminNewsList";

export const dynamic = "force-dynamic";

export default async function NoticiasPage() {
  const [news, categories] = await Promise.all([
    getPublicNewsAction(),
    getPublicNewsCategoriesAction(),
  ]);

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="mx-auto flex min-h-screen flex-col gap-8 px-3 pb-16 pt-6 sm:px-6 md:px-10 lg:px-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Noticias
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Explora las últimas novedades publicadas.
          </p>
        </header>

        <AdminNewsList news={news} categories={categories} />
      </div>
    </div>
  );
}
