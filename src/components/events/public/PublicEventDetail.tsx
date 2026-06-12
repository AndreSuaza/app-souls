import Link from "next/link";
import {
  IoChevronForwardOutline,
  IoDocumentTextOutline,
  IoFlashOutline,
  IoTimeOutline,
} from "react-icons/io5";
import type {
  PublicEventDetail,
  PublicEventListItem,
} from "@/interfaces/events.interface";
import { MarkdownContent } from "@/components/ui/markdown/MarkdownContent";
import { EventDetailTimelineNav } from "./EventDetailTimelineNav";
import { eventImageFallbacks } from "@/models/media-fallbacks.models";
import { FallbackImage } from "@/components/ui/image/FallbackImage";

type Props = {
  event: PublicEventDetail;
  recommended: PublicEventListItem[];
};

type EventDateParts = {
  day: string;
  month: string;
  monthShort: string;
  weekday: string;
  year: string;
  time: string;
  fullDate: string;
};

const getDate = (value?: string | null) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);

const formatEventDateParts = (value: string): EventDateParts => {
  const date = getDate(value);

  if (!date) {
    return {
      day: "--",
      month: "Fecha por confirmar",
      monthShort: "---",
      weekday: "Por confirmar",
      year: "",
      time: "--:--",
      fullDate: "Fecha por confirmar",
    };
  }

  return {
    day: new Intl.DateTimeFormat("es-CO", { day: "2-digit" }).format(date),
    month: new Intl.DateTimeFormat("es-CO", { month: "long" })
      .format(date)
      .toUpperCase(),
    monthShort: new Intl.DateTimeFormat("es-CO", { month: "short" })
      .format(date)
      .replace(".", "")
      .toUpperCase(),
    weekday: new Intl.DateTimeFormat("es-CO", { weekday: "long" })
      .format(date)
      .toUpperCase(),
    year: new Intl.DateTimeFormat("es-CO", { year: "numeric" }).format(date),
    time: formatTime(date),
    fullDate: new Intl.DateTimeFormat("es-CO", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(date),
  };
};

const formatEventRange = (startsAt: string, endsAt?: string | null) => {
  const start = getDate(startsAt);
  const end = getDate(endsAt);

  if (!start) return "Fecha por confirmar";

  if (!end)
    return `${formatEventDateParts(startsAt).fullDate} - ${formatTime(start)}`;

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  if (sameDay) {
    return `${formatEventDateParts(startsAt).fullDate} - ${formatTime(start)} a ${formatTime(end)}`;
  }

  const endDate = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(end);

  return `${formatEventDateParts(startsAt).fullDate} - ${endDate}`;
};

const timelineItems = [
  { href: "#fecha", label: "Fecha" },
  { href: "#resumen", label: "Resumen" },
  { href: "#detalles", label: "Detalles" },
  { href: "#proximos-eventos", label: "Otros eventos" },
];

const EventBadge = ({ label }: { label?: string | null }) => {
  if (!label) return null;

  return (
    <span className="inline-flex w-fit items-center rounded-sm border border-amber-400/70 bg-amber-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-amber-700 shadow-sm dark:border-amber-300/60 dark:bg-amber-400/15 dark:text-amber-100">
      {label}
    </span>
  );
};

const RecommendedCard = ({
  item,
  compact = false,
}: {
  item: PublicEventListItem;
  compact?: boolean;
}) => {
  const itemDate = formatEventDateParts(item.startsAt);

  return (
    <Link
      href={`/eventos/${item.slug}`}
      className={`group block overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-200/40 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:hover:border-purple-300/70 dark:hover:shadow-purple-950/30 ${
        compact ? "min-w-[145px] snap-start" : ""
      }`}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <FallbackImage
          src={item.cardImage}
          fallbackSrc={eventImageFallbacks.cards}
          alt={item.title}
          fill
          sizes={compact ? "150px" : "(min-width: 1024px) 260px, 50vw"}
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/10 to-transparent" />
        {item.badgeLabel && (
          <span className="absolute right-2 top-2 rounded-sm border border-amber-300/70 bg-black/70 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-amber-100">
            {item.badgeLabel}
          </span>
        )}
      </div>
      <div className="space-y-1 p-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-200">
          {itemDate.monthShort} {itemDate.day}
        </p>
        <h3
          className={`font-['Bebas_Neue'] uppercase leading-none tracking-wide text-slate-950 dark:text-white ${
            compact ? "text-xl" : "text-2xl"
          }`}
        >
          {item.title}
        </h3>
        {!compact && (
          <p className="line-clamp-2 text-xs leading-5 text-slate-500 dark:text-slate-300">
            {item.shortSummary}
          </p>
        )}
      </div>
    </Link>
  );
};

export const PublicEventDetailView = ({ event, recommended }: Props) => {
  const dateParts = formatEventDateParts(event.startsAt);
  const eventRange = formatEventRange(event.startsAt, event.endsAt);

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-[#0b0b0c] dark:text-white">
      <section className="hidden px-6 pb-10 pt-10 lg:block">
        <div className="mx-auto max-w-7xl">
          <div className="relative h-[430px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
            <FallbackImage
              src={event.featuredImage}
              fallbackSrc={eventImageFallbacks.banners}
              alt={event.title}
              title={event.title}
              fill
              priority
              sizes="(min-width: 1024px) 1280px, 100vw"
              className="object-cover transition duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-8 p-8">
              <div className="max-w-3xl">
                <EventBadge label={event.badgeLabel} />
                <h1 className="mt-5 font-['Bebas_Neue'] text-7xl uppercase leading-[0.9] tracking-wide text-white drop-shadow-xl xl:text-8xl">
                  {event.title}
                </h1>
              </div>
              <Link
                href="/eventos"
                className="inline-flex shrink-0 items-center gap-2 rounded-sm border border-purple-300/70 bg-purple-100 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-purple-800 shadow-lg transition hover:border-amber-300 hover:bg-amber-100 hover:text-amber-800 dark:border-purple-200/60 dark:bg-purple-200 dark:text-purple-950 dark:hover:bg-amber-200"
              >
                Ver calendario
                <IoChevronForwardOutline className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 pt-10 lg:hidden">
        <div className="mx-auto max-w-md">
          <div className="mb-7 text-center">
            <EventBadge label={event.badgeLabel} />
            <h1 className="mt-5 font-['Bebas_Neue'] text-8xl uppercase leading-none tracking-wide text-purple-700 dark:text-purple-200">
              {dateParts.day}
            </h1>
            <p className="font-['Bebas_Neue'] text-5xl uppercase leading-none tracking-wide text-slate-800 dark:text-slate-200">
              {dateParts.month}
            </p>
            <p className="mt-3 text-xs font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              {dateParts.weekday} - {dateParts.time}
            </p>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-3 top-5 bottom-0 w-px bg-gradient-to-b from-purple-400 via-purple-300/50 to-transparent dark:from-purple-200 dark:via-purple-200/30" />

            <div id="imagen" className="relative mb-10">
              <div className="absolute -left-8 top-5 flex h-6 w-6 items-center justify-center rounded-full border-4 border-slate-50 bg-purple-500 shadow-[0_0_16px_rgba(168,85,247,0.55)] dark:border-[#0b0b0c] dark:bg-purple-200">
                <span className="h-2 w-2 rounded-full bg-white dark:bg-purple-950" />
              </div>
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                <div className="relative aspect-[2/3] overflow-hidden">
                  <FallbackImage
                    src={event.cardImage}
                    fallbackSrc={eventImageFallbacks.cards}
                    alt={event.title}
                    fill
                    priority
                    sizes="(max-width: 1024px) calc(100vw - 64px), 420px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <h2 className="font-['Bebas_Neue'] text-4xl uppercase leading-none tracking-wide text-purple-100">
                      {event.title}
                    </h2>
                    <p className="mt-1 text-sm text-slate-200">
                      {event.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <MobileTimelineBlock icon={<IoTimeOutline />} label={eventRange}>
              <p className="text-lg leading-8 text-slate-700 dark:text-slate-100">
                {event.shortSummary}
              </p>
            </MobileTimelineBlock>

            <MobileTimelineBlock icon={<IoFlashOutline />} label="Evento">
              <h2 className="font-['Bebas_Neue'] text-3xl uppercase leading-none tracking-wide text-slate-950 dark:text-white">
                {event.subtitle}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                {event.badgeLabel
                  ? `Categoria del calendario: ${event.badgeLabel}.`
                  : "Evento oficial del calendario competitivo Souls In Xtinction."}
              </p>
            </MobileTimelineBlock>

            <MobileTimelineBlock
              icon={<IoDocumentTextOutline />}
              label="Detalles"
            >
              <MarkdownContent
                content={event.content}
                className="text-sm leading-7 text-slate-700 dark:text-slate-200"
              />
            </MobileTimelineBlock>
          </div>

          <Link
            href="/eventos"
            className="mt-3 inline-flex w-full items-center justify-center gap-3 rounded-sm bg-amber-400 px-5 py-4 text-xs font-black uppercase tracking-[0.2em] text-amber-950 shadow-[0_0_22px_rgba(251,191,36,0.28)] transition hover:bg-amber-300"
          >
            Ver calendario completo
            <IoFlashOutline className="h-4 w-4" />
          </Link>

          {recommended.length > 0 && (
            <section id="proximos-eventos" className="mt-14 scroll-mt-28">
              <div className="mb-5">
                <h2 className="font-['Bebas_Neue'] text-4xl uppercase italic leading-none tracking-wide text-slate-950 dark:text-white">
                  Otros eventos
                </h2>
              </div>
              <div className="-mx-4 flex snap-x gap-2 sm:gap-4 overflow-x-auto px-10 sm:px-4 pb-4">
                {recommended.map((item) => (
                  <RecommendedCard key={item.id} item={item} compact />
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <main className="hidden px-6 pb-24 lg:block">
        <div className="mx-auto grid max-w-7xl grid-cols-[72px_minmax(0,1fr)] gap-10">
          <aside className="relative">
            <div className="sticky top-28 flex flex-col items-center">
              <div className="absolute top-2 bottom-10 w-px bg-gradient-to-b from-purple-500 via-slate-300 to-transparent dark:from-purple-200 dark:via-tournament-dark-accent" />
              <EventDetailTimelineNav items={timelineItems} />
            </div>
          </aside>

          <div className="space-y-20">
            <section
              id="fecha"
              className="grid scroll-mt-28 gap-8 xl:grid-cols-[300px_minmax(0,1fr)]"
            >
              <div className="border-l-4 border-amber-400 pl-6">
                <p className="font-['Bebas_Neue'] text-7xl uppercase leading-none tracking-wide text-amber-600 dark:text-amber-200">
                  {dateParts.monthShort} {dateParts.day}
                </p>
                <p className="mt-2 text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  {dateParts.weekday} - {dateParts.time}
                </p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-purple-700 dark:text-purple-200">
                  {dateParts.year}
                </p>
              </div>

              <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-700 dark:text-purple-200">
                  {eventRange}
                </p>
                <h2 className="mt-4 font-['Bebas_Neue'] text-5xl uppercase leading-none tracking-wide text-slate-950 dark:text-white">
                  {event.subtitle}
                </h2>
                <p className="mt-5 max-w-3xl text-base leading-8 text-slate-600 dark:text-slate-300">
                  {event.shortSummary}
                </p>
              </div>
            </section>

            <section
              id="resumen"
              className="grid scroll-mt-28 gap-8 xl:grid-cols-2"
            >
              <article className="flex min-h-[330px] flex-col justify-between rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                <div>
                  <IoFlashOutline className="h-9 w-9 text-purple-700 dark:text-purple-200" />
                  <h2 className="mt-5 font-['Bebas_Neue'] text-5xl uppercase leading-none tracking-wide text-slate-950 dark:text-white">
                    Identidad del evento
                  </h2>
                  <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                    {event.badgeLabel
                      ? `${event.badgeLabel} dentro del calendario competitivo Souls In Xtinction.`
                      : "Evento oficial dentro del calendario competitivo Souls In Xtinction."}
                  </p>
                </div>
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-slate-600 dark:border-tournament-dark-accent dark:bg-tournament-dark-muted dark:text-slate-200">
                    {event.badgeLabel ?? "Evento oficial"}
                  </span>
                  <span className="rounded-sm border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-amber-700 dark:border-tournament-dark-accent dark:bg-tournament-dark-muted dark:text-amber-200">
                    {dateParts.monthShort} {dateParts.day}
                  </span>
                </div>
              </article>

              <article className="group relative min-h-[330px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
                <FallbackImage
                  src={event.cardImage}
                  fallbackSrc={eventImageFallbacks.cards}
                  alt={event.title}
                  fill
                  sizes="(min-width: 1280px) 560px, 50vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">
                    Imagen del evento
                  </p>
                  <h3 className="mt-2 font-['Bebas_Neue'] text-4xl uppercase leading-none tracking-wide text-white">
                    {event.title}
                  </h3>
                </div>
              </article>
            </section>

            <section
              id="detalles"
              className="scroll-mt-28 rounded-lg border border-slate-200 bg-white p-8 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface xl:px-28 xl:py-16"
            >
              <div className="mx-auto max-w-4xl">
                <div className="mb-8 border-b border-slate-200 pb-6 dark:border-tournament-dark-border">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-purple-700 dark:text-purple-200">
                    Detalles del evento
                  </p>
                  <h2 className="mt-3 font-['Bebas_Neue'] text-5xl uppercase leading-none tracking-wide text-slate-950 dark:text-white">
                    {!event.badgeLabel
                      ? event.badgeLabel
                      : "Reglamento y requisitoss"}
                  </h2>
                </div>
                <MarkdownContent
                  content={event.content}
                  className="text-base leading-8 text-slate-700 dark:text-slate-200 md:text-lg"
                />
              </div>
            </section>

            {recommended.length > 0 && (
              <section id="proximos-eventos" className="scroll-mt-28">
                <div className="mb-8 flex items-end justify-between gap-5">
                  <h2 className="font-['Bebas_Neue'] text-5xl uppercase leading-none tracking-wide text-slate-950 dark:text-white">
                    Proximos encuentros
                  </h2>
                  <Link
                    href="/eventos"
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-purple-700 transition hover:text-amber-600 dark:text-purple-200 dark:hover:text-amber-200"
                  >
                    Ver calendario completo
                    <IoChevronForwardOutline className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid gap-5 xl:grid-cols-4">
                  {recommended.map((item) => (
                    <RecommendedCard key={item.id} item={item} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const MobileTimelineBlock = ({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) => (
  <section className="relative mb-8">
    <div className="absolute -left-8 top-4 flex h-6 w-6 items-center justify-center rounded-full border-4 border-slate-50 bg-white text-purple-700 shadow-sm dark:border-[#0b0b0c] dark:bg-tournament-dark-muted dark:text-purple-200">
      <span className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-200" />
    </div>
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-tournament-dark-border dark:bg-tournament-dark-surface">
      <div className="mb-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-purple-700 dark:text-purple-200">
        <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-100">
          {icon}
        </span>
        <span>{label}</span>
      </div>
      {children}
    </div>
  </section>
);
