"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  FiBookOpen,
  FiCircle,
  FiClock,
  FiHeart,
  FiLayers,
  FiRefreshCw,
  FiRepeat,
  FiShield,
  FiStar,
  FiZap,
} from "react-icons/fi";

const SECTIONS = [
  { id: "mazos", label: "Mazos", number: "01", icon: FiLayers },
  { id: "inicio", label: "Inicio", number: "02", icon: FiStar },
  { id: "fases", label: "Fases", number: "03", icon: FiClock },
  { id: "accion", label: "Acción", number: "04", icon: FiZap },
  { id: "combate", label: "Combate", number: "05", icon: FiShield },
  { id: "conjuros", label: "Conjuros", number: "06", icon: FiBookOpen },
  { id: "resumen", label: "Resumen", number: "↺", icon: FiRefreshCw },
] as const;

const surface =
  "border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:border-[#362348] dark:bg-[#1f152a] dark:shadow-[0_18px_55px_rgba(6,2,12,0.28)]";
const interactiveSurface = `${surface} cursor-pointer transition duration-300 hover:-translate-y-1 hover:border-purple-400/55 hover:shadow-[0_20px_55px_rgba(124,58,237,0.14)] dark:hover:border-purple-400/55`;

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const Badge = ({
  children,
  tone = "purple",
}: {
  children: ReactNode;
  tone?: "purple" | "blue" | "gold";
}) => {
  const tones = {
    purple:
      "border-purple-400/40 bg-purple-500/10 text-purple-700 dark:text-purple-200",
    blue: "border-sky-400/40 bg-sky-400/10 text-sky-700 dark:text-sky-200",
    gold: "border-amber-400/45 bg-amber-300/10 text-amber-700 dark:border-amber-300/40 dark:text-amber-200",
  };

  return (
    <span
      className={`inline-flex rounded-sm border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const StepNode = ({
  number,
  tone = "gold",
}: {
  number: string;
  tone?: "gold" | "purple";
}) => (
  <div
    className={`relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-2 bg-white font-['Bebas_Neue'] text-5xl dark:bg-[#2a1d36] ${
      tone === "gold"
        ? "border-amber-400 text-amber-700 shadow-[0_0_28px_rgba(251,191,36,0.12)] dark:border-amber-300 dark:text-amber-200 dark:shadow-[0_0_28px_rgba(251,191,36,0.18)]"
        : "border-purple-500 text-purple-700 shadow-[0_0_28px_rgba(168,85,247,0.12)] dark:border-purple-400 dark:text-purple-200 dark:shadow-[0_0_28px_rgba(168,85,247,0.2)]"
    }`}
  >
    {number}
  </div>
);

const SectionHeading = ({
  eyebrow,
  title,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "right" | "center";
}) => (
  <div
    className={
      align === "right"
        ? "text-left md:text-right"
        : align === "center"
          ? "text-center"
          : "text-left"
    }
  >
    <Badge tone={eyebrow === "Místico" ? "blue" : "gold"}>{eyebrow}</Badge>
    <h2 className="mt-4 font-['Bebas_Neue'] text-4xl uppercase leading-none tracking-wide text-slate-950 dark:text-white sm:text-5xl">
      {title}
    </h2>
  </div>
);

export const HowToPlayGuide = () => {
  const [activeSection, setActiveSection] = useState("mazos");
  const scrollAnimationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const elements = SECTIONS.map(({ id }) =>
      document.getElementById(id),
    ).filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActiveSection(visible.target.id);
      },
      { rootMargin: "-18% 0px -62% 0px", threshold: [0.05, 0.2, 0.45] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (scrollAnimationFrameRef.current === null) return;
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
    };
  }, []);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    if (scrollAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(scrollAnimationFrameRef.current);
    }

    const startTop = window.scrollY;
    const targetTop = target.getBoundingClientRect().top + startTop - 112;
    const distance = targetTop - startTop;
    const duration = Math.min(900, Math.max(420, Math.abs(distance) * 0.45));
    const startedAt = window.performance.now();

    const animateScroll = (timestamp: number) => {
      const progress = Math.min((timestamp - startedAt) / duration, 1);
      window.scrollTo(0, startTop + distance * easeOutCubic(progress));

      if (progress < 1) {
        scrollAnimationFrameRef.current =
          window.requestAnimationFrame(animateScroll);
        return;
      }

      scrollAnimationFrameRef.current = null;
      window.history.replaceState(null, "", `#${id}`);
    };

    scrollAnimationFrameRef.current =
      window.requestAnimationFrame(animateScroll);
  };

  return (
    <div className="relative isolate w-full min-w-0 max-w-full overflow-x-clip bg-slate-50 text-slate-700 dark:bg-[#191022] dark:text-[#e8def3]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_8%,rgba(124,58,237,0.08),transparent_30%),radial-gradient(circle_at_88%_58%,rgba(45,212,191,0.06),transparent_27%),linear-gradient(180deg,#f8fafc_0%,#f1f5f9_38%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_14%_8%,rgba(39,68,148,0.22),transparent_30%),radial-gradient(circle_at_88%_58%,rgba(45,212,191,0.07),transparent_27%),linear-gradient(180deg,#100a16_0%,#191022_38%,#120b19_100%)]" />

      <div className="flex w-full min-w-0 items-stretch">
        <aside className="hidden w-64 shrink-0 self-stretch lg:block">
          <div className="sticky top-[82px] flex max-h-[calc(100vh-82px)] flex-col overflow-y-auto px-7 py-10">
            <nav
              className="relative flex flex-col"
              aria-label="Secciones de la guía"
            >
              <div className="absolute bottom-6 left-[7px] top-2 w-px bg-gradient-to-b from-purple-500 via-slate-300 to-transparent dark:from-purple-200 dark:via-[#4d3267]" />
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollToSection(id)}
                  aria-current={activeSection === id ? "location" : undefined}
                  className="group relative flex min-h-16 w-full cursor-pointer items-start gap-5 text-left outline-none"
                >
                  <span
                    className={`relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 transition group-hover:scale-125 group-focus-visible:ring-2 group-focus-visible:ring-purple-500 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-slate-50 dark:group-focus-visible:ring-purple-200 dark:group-focus-visible:ring-offset-[#191022] ${
                      activeSection === id
                        ? "border-purple-500 bg-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.45)] dark:border-purple-200 dark:bg-purple-200"
                        : "border-slate-300 bg-slate-50 group-hover:border-purple-500 dark:border-[#4d3267] dark:bg-[#191022] dark:group-hover:border-purple-200"
                    }`}
                  />
                  <span
                    className={`pt-0.5 text-[11px] font-bold uppercase tracking-[0.16em] transition ${
                      activeSection === id
                        ? "text-purple-700 dark:text-purple-100"
                        : "text-slate-500 group-hover:text-purple-700 dark:text-slate-400 dark:group-hover:text-purple-200"
                    }`}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <section className="relative flex min-h-[614px] w-full min-w-0 max-w-full items-center justify-center overflow-hidden border-b border-slate-200 px-5 py-24 text-center dark:border-[#362348]">
            <Image
              src="/souls-in-xtinction.webp"
              alt="Souls In Xtinction Trading Card Game"
              fill
              priority
              sizes="(min-width: 1024px) calc(100vw - 256px), 100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/35 via-slate-950/65 to-slate-950/90 dark:from-[#08060b]/30 dark:via-[#191022]/58 dark:to-[#191022]" />
            <div className="relative mx-auto w-full min-w-0 max-w-4xl">
              <p className="mb-5 text-xs font-black uppercase tracking-[0.38em] text-purple-200">
                — Guía rápida de juego —
              </p>
              <h1 className="font-['Bebas_Neue'] text-6xl uppercase leading-[0.9] tracking-wide text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.35)] sm:text-8xl lg:text-9xl">
                <span className="block sm:inline">Aprende a</span>{" "}
                <span className="block sm:inline">jugar</span>
              </h1>
              <p className="mt-5 font-['Bebas_Neue'] text-3xl uppercase tracking-[0.18em] text-teal-200 sm:text-5xl">
                Souls In Xtinction
              </p>
            </div>
          </section>

          <div className="relative mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:px-12">
            <div className="absolute bottom-40 left-1/2 top-32 z-0 hidden w-px -translate-x-1/2 bg-gradient-to-b from-amber-400/35 via-purple-400/25 to-transparent md:block dark:from-amber-300/45 dark:via-purple-400/35" />

            <section
              id="mazos"
              className="relative z-10 scroll-mt-28 pb-28 md:grid md:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] md:items-center md:gap-8"
            >
              <div className="order-2 mt-7 md:order-1 md:mt-0">
                <SectionHeading
                  eyebrow="Preparación"
                  title="Configura tus Mazos"
                  align="right"
                />
                <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-purple-100 md:text-right">
                  Cada jugador construye tres mazos separados antes de comenzar.
                  Además, cada jugador tiene una{" "}
                  <Badge tone="gold">Ficha de Ataque</Badge> que define su rol
                  en cada turno.
                </p>
              </div>

              <div className="order-1 flex w-full justify-center pt-10 md:order-2 md:pt-0">
                <StepNode number="01" />
              </div>

              <div className="order-3 mt-7 grid gap-3 md:mt-0">
                {[
                  {
                    title: "Mazo Principal",
                    value: "40",
                    text: "Contiene todas tus unidades, conjuros y habilidades del juego.",
                    image: "/howtoplay/mazo-principal.webp",
                    tone: "text-amber-700 dark:text-amber-200",
                  },
                  {
                    title: "Mazo de Almas",
                    value: "6",
                    text: "Tu recurso de juego. Ganas 1 alma por turno para pagar el coste de tus cartas.",
                    image: "/howtoplay/mazo-mana.webp",
                    tone: "text-sky-700 dark:text-sky-200",
                  },
                  {
                    title: "Mazo de Limbo",
                    value: "0–6",
                    text: "Cartas especiales opcionales. Puedes incluir de 0 a 6.",
                    image: "/howtoplay/mazo-limbo.webp",
                    tone: "text-purple-700 dark:text-purple-200",
                  },
                ].map((deck) => (
                  <article
                    key={deck.title}
                    className={`${interactiveSurface} group grid grid-cols-[82px_1fr] overflow-hidden rounded-lg`}
                  >
                    <div className="relative min-h-28 bg-slate-100 dark:bg-white">
                      <Image
                        src={deck.image}
                        alt={deck.title}
                        fill
                        sizes="82px"
                        className="object-contain p-2 transition duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-bold text-slate-950 dark:text-white">
                          {deck.title}
                        </h3>
                        <span
                          className={`font-['Bebas_Neue'] text-2xl ${deck.tone}`}
                        >
                          {deck.value}
                        </span>
                      </div>
                      <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-purple-200">
                        {deck.text}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section
              id="inicio"
              className="relative z-10 scroll-mt-28 pb-28 md:grid md:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] md:items-center md:gap-8"
            >
              <div
                className={`${surface} order-3 mt-7 overflow-hidden rounded-lg p-5 md:order-1 md:mt-0`}
              >
                <div className="relative mx-auto h-56 max-w-sm rounded bg-slate-50 dark:bg-white">
                  <Image
                    src="/howtoplay/ficha-ataque.webp"
                    alt="Ficha de Ataque de Souls In Xtinction"
                    fill
                    sizes="360px"
                    className="object-contain"
                  />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded border border-slate-200 bg-slate-50 p-3 text-center dark:border-[#4d3267] dark:bg-[#22172b]">
                    <strong className="font-['Bebas_Neue'] text-3xl text-amber-700 dark:text-amber-200">
                      6
                    </strong>
                    <span className="block text-xs text-slate-500 dark:text-purple-300">
                      Cartas iniciales
                    </span>
                  </div>
                  <div className="rounded border border-slate-200 bg-slate-50 p-3 text-center dark:border-[#4d3267] dark:bg-[#22172b]">
                    <strong className="font-['Bebas_Neue'] text-3xl text-red-700 dark:text-red-200">
                      6
                    </strong>
                    <span className="block text-xs text-slate-500 dark:text-purple-300">
                      Vidas
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-1 flex w-full justify-center pt-10 md:order-2 md:pt-0">
                <StepNode number="02" tone="purple" />
              </div>

              <div className="order-2 mt-7 md:order-3 md:mt-0">
                <SectionHeading
                  eyebrow="Comienzo"
                  title="El Primer Despertar"
                />
                <div className="mt-6 space-y-4">
                  {[
                    {
                      title: "Dado o Moneda",
                      text: (
                        <>
                          El ganador elige quién empieza con el rol de{" "}
                          <Badge>Atacante</Badge>. Ese jugador inicia la
                          partida.
                        </>
                      ),
                    },
                    {
                      title: "Mano Inicial",
                      text: (
                        <>
                          Cada jugador roba{" "}
                          <strong className="text-amber-700 dark:text-amber-200">
                            6 cartas
                          </strong>{" "}
                          de su mazo principal.
                        </>
                      ),
                    },
                    {
                      title: "Mulligan",
                      text: (
                        <>
                          Si no te gusta tu mano, puedes devolver las cartas que
                          quieras al mazo y volver a robar la misma cantidad.
                          Solo se puede hacer{" "}
                          <strong className="text-sky-700 dark:text-sky-200">
                            una vez por partida
                          </strong>
                          , al inicio.
                        </>
                      ),
                    },
                  ].map((item, index) => (
                    <article
                      key={item.title}
                      className="border-l-4 border-purple-500 bg-white p-4 shadow-sm dark:border-purple-400 dark:bg-[#1f152a] dark:shadow-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-['Bebas_Neue'] text-xl text-purple-400">
                          {index + 1}
                        </span>
                        <h3 className="font-bold text-slate-950 dark:text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-purple-100">
                        {item.text}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            <section id="fases" className="relative z-10 scroll-mt-28 pb-28">
              <div className="mx-auto flex justify-center">
                <StepNode number="03" />
              </div>
              <div className="mt-8 text-center">
                <h2 className="font-['Bebas_Neue'] text-5xl uppercase tracking-wide text-slate-950 dark:text-white">
                  Fases del Turno
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-purple-100">
                  Cada turno tiene 4 fases que se ejecutan siempre en este
                  orden:
                </p>
              </div>

              <div className="relative mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    title: "Fase de Almas",
                    text: "Ambos jugadores enderezan sus almas. Luego, cada jugador toma 1 alma de su mazo de almas y la coloca en la zona de almas como disponible.",
                    icon: FiStar,
                    tone: "text-sky-700 border-sky-400/35 dark:text-sky-200",
                  },
                  {
                    title: "Fase de Robo",
                    text: "Cada jugador roba 1 carta de su mazo principal. Se activan los efectos de fase de robo si los hay.",
                    icon: FiBookOpen,
                    tone: "text-amber-700 border-amber-400/35 dark:text-amber-200 dark:border-amber-300/35",
                  },
                  {
                    title: "Fase de Acción",
                    text: "La fase principal del juego. El Atacante inicia. Los jugadores se turnan haciendo acciones. Cuando los dos pasan seguido → termina la fase.",
                    icon: FiZap,
                    tone: "text-purple-700 border-purple-400/40 dark:text-purple-200",
                  },
                  {
                    title: "Fase Final",
                    text: "Se activan efectos de fin de turno. Los jugadores intercambian el rol Atacante ↔ Defensor y el turno termina.",
                    icon: FiRepeat,
                    tone: "text-teal-700 border-teal-400/35 dark:text-teal-200",
                  },
                ].map((phase, index) => {
                  const Icon = phase.icon;
                  return (
                    <article
                      key={phase.title}
                      className={`${interactiveSurface} ${phase.tone} rounded-lg border-t-4 p-5 text-center`}
                    >
                      <Icon className="mx-auto h-7 w-7" />
                      <span className="mt-4 block text-[10px] font-black uppercase tracking-[0.2em] opacity-70">
                        Fase {index + 1}
                      </span>
                      <h3 className="mt-2 font-bold text-slate-950 dark:text-white">
                        {phase.title}
                      </h3>
                      <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-purple-100">
                        {phase.text}
                      </p>
                    </article>
                  );
                })}
              </div>

              <div
                className={`${surface} relative mt-5 min-h-48 overflow-hidden rounded-lg dark:!bg-white`}
              >
                <Image
                  src="/howtoplay/fase-mana-1.webp"
                  alt="Funcionamiento de la zona de almas"
                  fill
                  sizes="(min-width: 1024px) 800px, 100vw"
                  className="object-contain p-5"
                />
              </div>
            </section>

            <section
              id="accion"
              className="relative z-10 scroll-mt-28 pb-28 md:grid md:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] md:items-center md:gap-8"
            >
              <div className="order-2 mt-7 md:order-1 md:mt-0">
                <SectionHeading
                  eyebrow="Estrategia"
                  title="Despliegue Táctico"
                  align="right"
                />
                <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-purple-100 md:text-right">
                  Cuando un jugador hace una acción, le cede la prioridad al
                  oponente. Cuando no quiere actuar, <strong>pasa</strong>. Si
                  los dos pasan seguido → fin de la Fase de Acción.
                </p>
              </div>

              <div className="order-1 flex w-full justify-center pt-10 md:order-2 md:pt-0">
                <StepNode number="04" tone="purple" />
              </div>

              <div className="order-3 mt-7 space-y-4 md:mt-0">
                {[
                  {
                    title: "Jugar una Carta",
                    text: "Paga el coste de almas indicado en la carta. La carta entra en juego.",
                    icon: FiLayers,
                  },
                  {
                    title: "Atacar",
                    text: "Solo disponible para el Atacante. Se puede atacar una sola vez por turno.",
                    icon: FiZap,
                  },
                  {
                    title: "Activar un Efecto",
                    text: "Activa la habilidad de una carta que ya está en juego.",
                    icon: FiCircle,
                  },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <article
                      key={action.title}
                      className="flex gap-4 border-l-4 border-teal-500 bg-white p-4 shadow-sm dark:border-teal-300 dark:bg-[#1f152a] dark:shadow-none"
                    >
                      <Icon className="mt-1 h-5 w-5 shrink-0 text-teal-600 dark:text-teal-300" />
                      <div>
                        <h3 className="font-bold text-slate-950 dark:text-white">
                          {action.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-purple-100">
                          {action.text}
                        </p>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section id="combate" className="relative z-10 scroll-mt-28 pb-28">
              <div className="mx-auto flex justify-center">
                <StepNode number="05" />
              </div>
              <article
                className={`${surface} mt-10 overflow-hidden rounded-xl p-6 sm:p-8`}
              >
                <SectionHeading
                  eyebrow="Combate"
                  title="Resolución de Combate"
                  align="center"
                />
                <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-6 text-slate-600 dark:text-purple-100">
                  El Atacante elige atacar una vez por turno. El combate se
                  resuelve en 3 pasos:
                </p>

                <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_1.1fr]">
                  <div className="space-y-6">
                    {[
                      {
                        title: "Declaración de Atacantes",
                        text: "El Atacante sube a la zona de combate una o varias unidades.",
                      },
                      {
                        title: "Declaración de Defensores",
                        text: "El Defensor coloca unidades al frente para bloquear. Una unidad bloqueadora por unidad atacante.",
                      },
                      {
                        title: "Juego Rápido",
                        text: "Primero el Atacante activa conjuros. Luego el Defensor activa conjuros. (Se pueden activar varios al mismo tiempo)",
                      },
                    ].map((step, index) => (
                      <div key={step.title}>
                        <div className="flex items-center gap-4">
                          <span className="font-['Bebas_Neue'] text-3xl text-purple-400/70">
                            Step {index + 1}
                          </span>
                          <span className="h-px flex-1 bg-slate-200 dark:bg-[#4d3267]" />
                        </div>
                        <h3 className="mt-3 text-lg font-bold text-amber-800 dark:text-amber-100">
                          {step.title}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-purple-100">
                          {step.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-3">
                    {[
                      ["/howtoplay/ataque.webp", "Declaración de ataque"],
                      ["/howtoplay/bloqueo.webp", "Declaración de bloqueos"],
                    ].map(([src, alt]) => (
                      <div
                        key={src}
                        className="relative min-h-64 overflow-hidden rounded bg-white"
                      >
                        <Image
                          src={src}
                          alt={alt}
                          fill
                          sizes="(min-width: 1280px) 440px, (min-width: 640px) 70vw, 100vw"
                          className="object-contain"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 border-t border-slate-200 pt-7 dark:border-[#362348]">
                  <div className="mb-5 flex items-center gap-3">
                    <FiHeart className="h-6 w-6 text-red-300" />
                    <h3 className="text-xl font-bold text-amber-800 dark:text-amber-100">
                      Daño y Vidas
                    </h3>
                  </div>
                  <div className="grid gap-x-10 gap-y-4 md:grid-cols-2">
                    {[
                      "Cada jugador empieza con 6 vidas.",
                      "Si una unidad atacante no fue bloqueada, el defensor pierde vidas igual a la fuerza de esa unidad.",
                      "El primero en quitarle todas las vidas al oponente gana la partida.",
                      "Si un jugador debe robar cartas y no le quedan en el mazo, pierde la partida.",
                    ].map((item) => (
                      <div key={item} className="flex gap-3">
                        <FiCircle className="mt-2 h-2 w-2 shrink-0 fill-amber-300 text-amber-300" />
                        <p className="text-sm leading-6 text-slate-600 dark:text-purple-100">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 rounded border-l-4 border-amber-500 bg-amber-100 p-5 text-sm leading-6 text-amber-950 dark:border-amber-300 dark:bg-amber-300/10 dark:text-amber-50">
                  El orden de ataque va de la unidad más a la izquierda del
                  Atacante hacia la derecha, enfrentándose en orden hasta la
                  última unidad.
                </div>
              </article>
            </section>

            <section
              id="conjuros"
              className="relative z-10 scroll-mt-28 pb-28 md:grid md:grid-cols-[minmax(0,1fr)_96px_minmax(0,1fr)] md:items-center md:gap-8"
            >
              <div
                className={`${surface} order-3 mt-7 overflow-hidden rounded-lg p-4 md:order-1 md:mt-0`}
              >
                <div className="relative min-h-80 rounded bg-slate-50 dark:bg-white">
                  <Image
                    src="/howtoplay/conjuro.webp"
                    alt="Carta de conjuro de Souls In Xtinction"
                    fill
                    sizes="420px"
                    className="object-contain"
                  />
                </div>
              </div>

              <div className="order-1 flex w-full justify-center pt-10 md:order-2 md:pt-0">
                <StepNode number="06" tone="purple" />
              </div>

              <div className="order-2 mt-7 md:order-3 md:mt-0">
                <SectionHeading
                  eyebrow="Místico"
                  title="El Poder de los Conjuros"
                />
                <p className="mt-5 text-sm leading-7 text-slate-600 dark:text-purple-100">
                  Los conjuros son cartas especiales que puedes jugar de dos
                  maneras distintas:
                </p>

                <div className="mt-5 space-y-4">
                  <article className={`${interactiveSurface} rounded-lg p-5`}>
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-slate-950 dark:text-white">
                        Como Acción Normal
                      </h3>
                      <Badge tone="gold">Gasta acción</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-purple-100">
                      Lo juegas en tu turno pagando su coste de almas. Se
                      consume tu acción del turno. Al resolverse, el conjuro va
                      al cementerio.
                    </p>
                  </article>
                  <article
                    className={`${interactiveSurface} rounded-lg border-sky-400/35 p-5`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-bold text-sky-800 dark:text-sky-100">
                        En Respuesta
                      </h3>
                      <Badge tone="blue">No gasta acción</Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-purple-100">
                      Se juega en reacción a un efecto o conjuro del oponente.
                      No gasta tu acción — puedes usarlo incluso si ya pasaste
                      ese turno. Al resolverse, va al cementerio.
                    </p>
                  </article>
                </div>

                <div className="mt-4 border-l-4 border-sky-500 bg-sky-100 p-4 text-sm leading-6 text-sky-950 dark:border-sky-300 dark:bg-sky-300/10 dark:text-sky-50">
                  Los conjuros en respuesta son tu herramienta de reacción más
                  poderosa: permiten contestar al oponente sin costo de acción.
                </div>
              </div>
            </section>

            <section
              id="resumen"
              className="relative z-10 scroll-mt-28 pb-20 pt-8"
            >
              <div className="mx-auto max-w-3xl overflow-hidden rounded-xl border-2 border-amber-400/60 bg-white shadow-[0_0_38px_rgba(251,191,36,0.1)] dark:border-amber-300/60 dark:bg-[#2a1d36] dark:shadow-[0_0_38px_rgba(251,191,36,0.12)]">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-5 dark:border-[#4d3267]">
                  <div className="flex items-center gap-3">
                    <FiRefreshCw className="h-7 w-7 text-amber-700 dark:text-amber-200" />
                    <h2 className="font-['Bebas_Neue'] text-3xl uppercase tracking-wide text-slate-950 dark:text-white">
                      Resumen del Turno
                    </h2>
                  </div>
                  <Badge tone="gold">Guía rápida</Badge>
                </div>

                {[
                  {
                    number: "1",
                    title: "Almas",
                    text: "Endereza tus almas → toma 1 nueva alma y ponla disponible.",
                    icon: FiStar,
                  },
                  {
                    number: "2",
                    title: "Robo",
                    text: "Roba 1 carta. Se activan efectos de fase de robo.",
                    icon: FiBookOpen,
                  },
                  {
                    number: "3",
                    title: "Acción",
                    text: "El Atacante inicia. Jugar cartas, atacar (1 vez), activar efectos. Cuando ambos pasan → fin.",
                    icon: FiZap,
                  },
                  {
                    number: "4",
                    title: "Final",
                    text: "Efectos de fin de turno. Intercambiar roles Atk ↔ Def. Fin del turno.",
                    icon: FiRepeat,
                  },
                ].map((row, index) => {
                  const Icon = row.icon;
                  return (
                    <div
                      key={row.title}
                      className={`grid grid-cols-[74px_1fr] ${
                        index > 0
                          ? "border-t border-slate-200 dark:border-[#362348]"
                          : ""
                      } ${
                        index % 2 === 0
                          ? "bg-white dark:bg-[#2a1d36]"
                          : "bg-slate-50 dark:bg-[#22172b]"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center border-r border-slate-200 px-3 py-5 text-amber-700 dark:border-[#362348] dark:text-amber-200">
                        <span className="font-['Bebas_Neue'] text-2xl">
                          {row.number}
                        </span>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-slate-950 dark:text-white">
                          {row.title}
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-purple-100">
                          {row.text}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="border-t border-slate-200 bg-white px-5 py-24 text-center dark:border-[#362348] dark:bg-[#100a16]">
            <Image
              src="/souls-in-xtinction-logo-sm.png"
              alt="Logo de Souls In Xtinction"
              width={64}
              height={64}
              className="mx-auto h-16 w-16 object-contain"
            />
            <h2 className="mt-5 font-['Bebas_Neue'] text-6xl uppercase tracking-wide text-slate-950 dark:text-white">
              ¡A jugar!
            </h2>
            <p className="mt-3 text-lg text-teal-700 dark:text-teal-200">
              Souls In Xtinction — Que el alma más fuerte gane.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
};
