"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PublicEventListItem } from "@/interfaces/events.interface";
import { eventImageFallbacks } from "@/models/media-fallbacks.models";
import { FallbackImage } from "@/components/ui/image/FallbackImage";

type Props = {
  events: PublicEventListItem[];
  referenceDate: string;
};

type EventDay = {
  key: string;
  month: string;
  day: string;
  weekday: string;
};

type EventMonthGroup = {
  key: string;
  label: string;
  events: PublicEventListItem[];
};

const getEventDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDayKey = (value: string) => {
  const date = getEventDate(value);
  if (!date) return "";
  return date.toISOString().slice(0, 10);
};

const formatEventDate = (value: string) => {
  const date = getEventDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatEventTime = (value: string) => {
  const date = getEventDate(value);
  if (!date) return "";

  return new Intl.DateTimeFormat("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const buildEventDays = (events: PublicEventListItem[]): EventDay[] => {
  const grouped = new Map<string, Date>();

  events.forEach((event) => {
    const date = getEventDate(event.startsAt);
    if (!date) return;
    grouped.set(getDayKey(event.startsAt), date);
  });

  return Array.from(grouped.entries())
    .sort(([, dateA], [, dateB]) => dateA.getTime() - dateB.getTime())
    .map(([key, date]) => ({
      key,
      month: new Intl.DateTimeFormat("es-CO", { month: "short" })
        .format(date)
        .replace(".", "")
        .toUpperCase(),
      day: new Intl.DateTimeFormat("es-CO", { day: "2-digit" }).format(date),
      weekday: new Intl.DateTimeFormat("es-CO", { weekday: "short" })
        .format(date)
        .replace(".", "")
        .toUpperCase(),
    }));
};

const buildEventMonthGroups = (
  events: PublicEventListItem[],
): EventMonthGroup[] => {
  const groups = new Map<string, EventMonthGroup>();

  events.forEach((event) => {
    const date = getEventDate(event.startsAt);
    if (!date) return;

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
    const currentGroup = groups.get(key);

    if (currentGroup) {
      currentGroup.events.push(event);
      return;
    }

    const month = new Intl.DateTimeFormat("es-CO", { month: "short" })
      .format(date)
      .replace(".", "")
      .toUpperCase();

    groups.set(key, {
      key,
      label: `${month} ${date.getFullYear()}`,
      events: [event],
    });
  });

  return Array.from(groups.values());
};

const EventMonthDivider = ({ label }: { label: string }) => (
  <div className="flex items-center gap-5">
    <div className="h-px flex-1 bg-slate-300 dark:bg-white/10" />
    <h2 className="event-calendar-glow shrink-0 font-['Bebas_Neue'] text-4xl uppercase leading-none tracking-wide text-teal-700 dark:text-teal-200 md:text-5xl">
      {label}
    </h2>
  </div>
);

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const isPastEvent = (event: PublicEventListItem, referenceTime: number) => {
  const endDate = getEventDate(event.endsAt ?? event.startsAt);
  return endDate ? endDate.getTime() < referenceTime : false;
};

const PastEventCard = ({
  event,
  compact = false,
}: {
  event: PublicEventListItem;
  compact?: boolean;
}) => (
  <Link
    href={`/eventos/${event.slug}`}
    className={`group block overflow-hidden rounded-lg border border-slate-200 bg-white opacity-80 shadow-sm transition hover:opacity-100 dark:border-white/10 dark:bg-white/[0.025] dark:shadow-none ${
      compact
        ? "min-w-[170px] snap-start"
        : "hover:-translate-y-1 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-500/10 dark:hover:border-purple-300/40"
    }`}
  >
    <div className="relative aspect-[2/3] overflow-hidden">
      <FallbackImage
        src={event.cardImage}
        fallbackSrc={eventImageFallbacks.cards}
        alt={event.title}
        fill
        sizes={compact ? "170px" : "(min-width: 1280px) 240px, 25vw"}
        className="object-cover object-top grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
      <span className="absolute right-2 top-2 rounded-sm border border-slate-300/60 bg-white/85 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-700 dark:bg-black/70 dark:text-slate-200">
        Finalizado
      </span>
    </div>
    <div className="space-y-1 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {formatEventDate(event.startsAt)}
      </p>
      <h3
        className={`font-['Bebas_Neue'] uppercase leading-none tracking-wide text-slate-800 dark:text-slate-200 ${
          compact ? "text-xl" : "text-2xl"
        }`}
      >
        {event.title}
      </h3>
    </div>
  </Link>
);

export const PublicEventsCalendar = ({ events, referenceDate }: Props) => {
  const [isPathHovered, setIsPathHovered] = useState(false);
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const referenceTime = useMemo(() => {
    const date = getEventDate(referenceDate);
    return date ? date.getTime() : Date.now();
  }, [referenceDate]);
  const upcomingEvents = useMemo(
    () => events.filter((event) => !isPastEvent(event, referenceTime)),
    [events, referenceTime],
  );
  const availableCities = useMemo(
    () =>
      Array.from(
        new Set(
          upcomingEvents
            .map((event) => event.storeCity?.trim())
            .filter((city): city is string => Boolean(city)),
        ),
      ).sort((cityA, cityB) => cityA.localeCompare(cityB, "es")),
    [upcomingEvents],
  );
  const filteredUpcomingEvents = useMemo(() => {
    if (selectedCities.length === 0) return upcomingEvents;

    return upcomingEvents.filter((event) =>
      selectedCities.includes(event.storeCity ?? ""),
    );
  }, [selectedCities, upcomingEvents]);
  const pastEvents = useMemo(
    () =>
      events
        .filter((event) => isPastEvent(event, referenceTime))
        .sort(
          (eventA, eventB) =>
            new Date(eventB.startsAt).getTime() -
            new Date(eventA.startsAt).getTime(),
        ),
    [events, referenceTime],
  );
  const [selectedDay, setSelectedDay] = useState(() =>
    filteredUpcomingEvents[0]
      ? getDayKey(filteredUpcomingEvents[0].startsAt)
      : "",
  );
  const scrollAnimationFrameRef = useRef<number | null>(null);

  const eventDays = useMemo(
    () => buildEventDays(filteredUpcomingEvents),
    [filteredUpcomingEvents],
  );
  const upcomingEventGroups = useMemo(
    () => buildEventMonthGroups(filteredUpcomingEvents),
    [filteredUpcomingEvents],
  );

  useEffect(() => {
    if (eventDays.length === 0) {
      setSelectedDay("");
      return;
    }

    if (!eventDays.some((day) => day.key === selectedDay)) {
      setSelectedDay(eventDays[0].key);
    }
  }, [eventDays, selectedDay]);

  useEffect(() => {
    const cards = Array.from(document.querySelectorAll(".event-calendar-card"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("event-calendar-card-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1 },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredUpcomingEvents]);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrameRef.current === null) return;
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
    };
  }, []);

  const handleMobileDayClick = (dayKey: string) => {
    setSelectedDay(dayKey);
    const target = document.querySelector<HTMLElement>(
      `[data-event-day="${dayKey}"]`,
    );

    if (!target) return;

    if (scrollAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
    }

    const startTop = window.scrollY;
    const targetTop = target.getBoundingClientRect().top + startTop - 112;
    const distance = targetTop - startTop;
    const duration = Math.min(900, Math.max(420, Math.abs(distance) * 0.45));
    const startedAt = window.performance.now();

    // Animacion manual para evitar saltos en navegadores que ignoran scroll smooth.
    const animateScroll = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      const nextTop = startTop + distance * easeOutCubic(progress);

      window.scrollTo(0, nextTop);

      if (progress < 1) {
        scrollAnimationFrameRef.current =
          window.requestAnimationFrame(animateScroll);
        return;
      }

      scrollAnimationFrameRef.current = null;
    };

    scrollAnimationFrameRef.current =
      window.requestAnimationFrame(animateScroll);
  };

  const toggleCity = (city: string) => {
    setSelectedCities((currentCities) =>
      currentCities.includes(city)
        ? currentCities.filter((currentCity) => currentCity !== city)
        : [...currentCities, city],
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#0b0b0c] dark:text-white">
      <div className="event-calendar-nebula" />

      <main className="relative mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-16 lg:px-12 xl:px-16">
        <div className="pointer-events-none absolute inset-0 z-0 hidden opacity-20 lg:block">
          <svg
            fill="none"
            height="100%"
            viewBox="0 0 1200 900"
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              className="event-calendar-path"
              d="M600 0V150L980 310L240 560L920 760"
              stroke={isPathHovered ? "#ffb95f" : "#d0bcff"}
              strokeWidth="2"
            />
          </svg>
        </div>

        <section className="relative z-10 mb-14 text-center md:mb-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-purple-700 dark:text-purple-200">
            La ruta competitiva
          </p>
          <h1 className="mb-4 font-['Bebas_Neue'] text-5xl uppercase leading-none tracking-wide text-slate-950 dark:text-white md:text-8xl">
            Calendario de eventos
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-300 md:text-lg">
            Navega los próximos eventos de Souls In Xtinction, descubre fechas,
            sedes y experiencias destacadas del circuito.
          </p>
        </section>

        {availableCities.length > 0 && (
          <section
            className="relative z-10 mb-10 md:mb-14"
            aria-label="Filtrar eventos por ciudad"
          >
            <p className="mb-3 text-center text-[11px] font-black uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Filtrar por ciudad
            </p>
            <div className="-mx-4 overflow-x-auto px-4 pb-2 md:mx-0 md:overflow-visible md:px-0">
              <div className="flex min-w-max justify-start gap-2 md:min-w-0 md:flex-wrap md:justify-center md:gap-3">
                {availableCities.map((city) => {
                  const isSelected = selectedCities.includes(city);

                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      aria-pressed={isSelected}
                      className={`whitespace-nowrap rounded border px-4 py-2 text-xs font-black uppercase tracking-[0.12em] transition duration-200 ${
                        isSelected
                          ? "border-teal-500 bg-teal-500 text-slate-950 shadow-[0_0_18px_rgba(45,212,191,0.35)] dark:border-teal-300 dark:bg-teal-300"
                          : "border-slate-300 bg-white/70 text-slate-600 hover:border-purple-400 hover:text-purple-700 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-purple-300/60 dark:hover:text-purple-200"
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <section className="relative z-10 hidden md:block">
          {upcomingEvents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-300 dark:shadow-none">
              No hay próximos eventos publicados por ahora.
            </div>
          ) : filteredUpcomingEvents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-300 dark:shadow-none">
              No hay próximos eventos en las ciudades seleccionadas.
            </div>
          ) : (
            <div className="space-y-16">
              {upcomingEventGroups.map((group) => (
                <section key={group.key} className="space-y-10">
                  <EventMonthDivider label={group.label} />
                  <div className="grid grid-cols-4 gap-5">
                    {group.events.map((event) => {
                      const hasBadge = Boolean(event.badgeLabel);

                      return (
                        <Link
                          key={event.id}
                          href={`/eventos/${event.slug}`}
                          className="group relative block"
                          onMouseEnter={() => setIsPathHovered(true)}
                          onMouseLeave={() => setIsPathHovered(false)}
                        >
                          <article
                            className={`event-calendar-card event-calendar-holo relative aspect-[2/3] overflow-hidden rounded-lg ${
                              hasBadge ? "event-calendar-card-accent" : ""
                            }`}
                          >
                            <FallbackImage
                              src={event.cardImage}
                              fallbackSrc={eventImageFallbacks.cards}
                              alt={event.title}
                              title={event.title}
                              fill
                              sizes="(min-width: 1280px) 280px, 25vw"
                              className="object-cover transition duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/25 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-6">
                              {event.badgeLabel && (
                                <span
                                  className={`mb-3 inline-block rounded border px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${
                                    hasBadge
                                      ? "border-amber-300/70 bg-black/60 text-amber-100"
                                      : "border-purple-300/70 bg-black/60 text-purple-100"
                                  }`}
                                >
                                  {event.badgeLabel}
                                </span>
                              )}
                              <h3
                                className={`font-['Bebas_Neue'] text-3xl uppercase leading-none tracking-wide ${
                                  hasBadge ? "text-amber-100" : "text-white"
                                }`}
                              >
                                {event.title}
                              </h3>
                              <p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-300">
                                {event.subtitle}
                              </p>
                            </div>
                          </article>
                          <div className="mt-4 text-center">
                            <p
                              className={`text-sm font-semibold ${
                                hasBadge
                                  ? "event-calendar-glow text-amber-700 dark:text-amber-200"
                                  : "text-slate-800 dark:text-white"
                              }`}
                            >
                              {formatEventDate(event.startsAt)}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          )}

          {pastEvents.length > 0 && (
            <section className="mt-20 border-t border-slate-200 pt-10 dark:border-white/10">
              <div className="mb-8 flex items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500">
                    Historial
                  </p>
                  <h2 className="mt-2 font-['Bebas_Neue'] text-4xl uppercase leading-none tracking-wide text-slate-800 dark:text-slate-300">
                    Eventos finalizados
                  </h2>
                </div>
                <span className="rounded-sm border border-slate-300 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-sm dark:border-slate-500/40 dark:bg-transparent dark:text-slate-400 dark:shadow-none">
                  Ya pasaron
                </span>
              </div>
              <div className="grid grid-cols-4 gap-5">
                {pastEvents.map((event) => (
                  <PastEventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}
        </section>

        <section className="relative z-10 -mx-4 space-y-6 md:hidden">
          <div className="px-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Elige una fecha para saltar al evento correspondiente.
            </p>
          </div>

          {upcomingEvents.length === 0 ? (
            <div className="mx-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-300 dark:shadow-none">
              No hay próximos eventos publicados por ahora.
            </div>
          ) : filteredUpcomingEvents.length === 0 ? (
            <div className="mx-4 rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600 shadow-sm dark:border-white/15 dark:bg-white/[0.03] dark:text-slate-300 dark:shadow-none">
              No hay próximos eventos en las ciudades seleccionadas.
            </div>
          ) : (
            <>
              <div className="event-calendar-mobile-days overflow-x-auto px-4 pb-1">
                <div className="flex min-w-max gap-3">
                  {eventDays.map((day) => {
                    const isActive = day.key === selectedDay;

                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => handleMobileDayClick(day.key)}
                        className={`event-calendar-day-tile ${
                          isActive ? "event-calendar-day-tile-active" : ""
                        }`}
                        aria-pressed={isActive}
                      >
                        <span className="event-calendar-day-month">
                          {day.month}
                        </span>
                        <span className="event-calendar-day-number">
                          {day.day}
                        </span>
                        <span className="event-calendar-day-weekday">
                          {day.weekday}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative px-4 pb-8">
                <div className="event-calendar-mobile-timeline-line" />
                <div className="space-y-10">
                  {upcomingEventGroups.map((group) => (
                    <section key={group.key} className="space-y-6">
                      <div className="pl-20">
                        <EventMonthDivider label={group.label} />
                      </div>
                      <div className="space-y-7">
                        {group.events.map((event) => {
                          const dayKey = getDayKey(event.startsAt);
                          const hasBadge = Boolean(event.badgeLabel);

                          return (
                            <div
                              key={event.id}
                              data-event-day={dayKey}
                              className="relative flex scroll-mt-28 gap-5"
                            >
                              <div className="relative z-10 flex w-16 shrink-0 flex-col items-center">
                                <div
                                  className={`event-calendar-mobile-node ${
                                    hasBadge
                                      ? "event-calendar-mobile-node-accent"
                                      : ""
                                  }`}
                                >
                                  <span className="h-2.5 w-2.5 rounded-full bg-teal-300" />
                                </div>
                                <span className="mt-2 text-xs font-bold text-purple-700 dark:text-purple-200">
                                  {formatEventTime(event.startsAt)}
                                </span>
                              </div>

                              <Link
                                href={`/eventos/${event.slug}`}
                                className={`event-calendar-mobile-card group ${
                                  hasBadge
                                    ? "event-calendar-mobile-card-accent"
                                    : ""
                                }`}
                              >
                                <div className="relative h-48 overflow-hidden rounded-t-lg">
                                  <FallbackImage
                                    src={event.cardImage}
                                    fallbackSrc={eventImageFallbacks.cards}
                                    alt={event.title}
                                    fill
                                    sizes="calc(100vw - 112px)"
                                    className="object-cover object-top transition duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                                  <div className="absolute bottom-3 left-4 right-4">
                                    {event.badgeLabel && (
                                      <span
                                        className={`mb-2 inline-block rounded-sm border bg-black/60 px-2 py-1 text-[10px] font-black uppercase tracking-widest ${
                                          hasBadge
                                            ? "border-amber-300/70 text-amber-100"
                                            : "border-teal-300/70 text-teal-100"
                                        }`}
                                      >
                                        {event.badgeLabel}
                                      </span>
                                    )}
                                    <h3 className="font-['Bebas_Neue'] text-3xl uppercase leading-none tracking-wide text-white">
                                      {event.title}
                                    </h3>
                                  </div>
                                </div>

                                <div className="space-y-3 p-4">
                                  <p className="line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-100">
                                    {event.shortSummary}
                                  </p>
                                  <div className="flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-amber-200">
                                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1 dark:border-amber-300/25 dark:bg-amber-300/10">
                                      {formatEventDate(event.startsAt)}
                                    </span>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </div>
            </>
          )}

          {pastEvents.length > 0 && (
            <section className="px-4 pt-4">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-slate-500">
                    Historial
                  </p>
                  <h2 className="font-['Bebas_Neue'] text-3xl uppercase leading-none tracking-wide text-slate-800 dark:text-slate-300">
                    Eventos finalizados
                  </h2>
                </div>
                <span className="rounded-sm border border-slate-300 bg-white px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 shadow-sm dark:border-slate-500/40 dark:bg-transparent dark:text-slate-400 dark:shadow-none">
                  Pasados
                </span>
              </div>
              <div className="-mx-4 flex snap-x gap-2 sm:gap-4 overflow-x-auto px-10 sm:px-4 pb-4">
                {pastEvents.map((event) => (
                  <PastEventCard key={event.id} event={event} compact />
                ))}
              </div>
            </section>
          )}
        </section>
      </main>
    </div>
  );
};
