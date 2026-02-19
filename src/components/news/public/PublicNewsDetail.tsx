import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaWhatsapp } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import type { PublicNewsCard, PublicNewsDetail } from "@/interfaces";
import { MarkdownContent } from "@/components";
import { NewsCarousel } from "./NewsCarousel";

type Props = {
  news: PublicNewsDetail;
  recommended: PublicNewsCard[];
};

const formatNewsDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  return `${day} de ${month} ${year}`;
};

export const PublicNewsDetailView = ({ news, recommended }: Props) => {
  const categoryLabel = news.categoryName ?? "Sin categoría";
  const formattedDate = formatNewsDate(news.publishedAt);
  const shareUrl = `https://soulsinxtinction.com/noticias/${news.id}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(
    shareUrl,
  )}`;
  const facebookShareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl,
  )}`;
  const xShareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
    shareUrl,
  )}`;
  const shareButtonClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-md border border-purple-300/70 bg-purple-100/70 text-purple-700 shadow-sm transition hover:border-purple-400 hover:text-purple-800 dark:border-purple-300/60 dark:bg-purple-300/15 dark:text-purple-100";

  return (
    <div className="bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
      <div className="relative h-[120px] w-full overflow-hidden sm:h-[150px] md:h-[180px]">
        <Image
          src={`/news/${news.featuredImage}`}
          alt={news.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/10 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-extrabold uppercase tracking-wide text-white md:text-4xl">
              {news.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
              <span className="inline-flex cursor-default items-center rounded-full border border-purple-300/70 bg-purple-100/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-purple-700 dark:border-purple-300/60 dark:bg-purple-300/15 dark:text-purple-100">
                {categoryLabel}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-300">
                {formattedDate}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-xl font-medium text-slate-900 dark:text-white md:text-2xl">
              {news.subtitle}
            </h2>
            <div className="flex items-center gap-2">
              <Link
                href={whatsappShareLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Compartir en WhatsApp"
                aria-label="Compartir en WhatsApp"
                className={shareButtonClass}
              >
                <FaWhatsapp className="h-4 w-4" />
              </Link>
              <Link
                href={facebookShareLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Compartir en Facebook"
                aria-label="Compartir en Facebook"
                className={shareButtonClass}
              >
                <FaFacebookF className="h-4 w-4" />
              </Link>
              <Link
                href={xShareLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Compartir en X"
                aria-label="Compartir en X"
                className={shareButtonClass}
              >
                <FaXTwitter className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <hr className="border-slate-200 dark:border-tournament-dark-border" />

          <MarkdownContent
            content={news.content}
            className="text-base md:text-lg"
          />
        </div>

        <div className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            Otras noticias
          </h2>
          <NewsCarousel items={recommended} />
        </div>
      </div>
    </div>
  );
};
