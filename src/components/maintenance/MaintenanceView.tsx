"use client";

import { useEffect, useState } from "react";

interface MaintenanceViewProps {
  cinzelClassName: string;
  interClassName: string;
}

export function MaintenanceView({
  cinzelClassName,
  interClassName,
}: MaintenanceViewProps) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [progressReady, setProgressReady] = useState(false);

  useEffect(() => {
    // Activamos la animacion del progreso luego del render inicial.
    const timer = setTimeout(() => setProgressReady(true), 150);
    return () => clearTimeout(timer);
  }, []);

  const isDark = theme === "dark";

  return (
    <div
      data-theme={theme}
      className={`relative min-h-screen w-full overflow-hidden bg-[#0d0b14] text-[#f0ecff] transition-colors duration-300 data-[theme=light]:bg-[#f5f3ff] data-[theme=light]:text-[#1e1033] ${interClassName}`}
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.04] data-[theme=light]:opacity-[0.06]">
        <span className="absolute left-[5%] top-[5%] text-[7rem] text-[#7c3aed] animate-[pulse_8s_ease-in-out_infinite]">
          ☯
        </span>
        <span className="absolute right-[8%] top-[18%] text-[5rem] text-[#7c3aed] animate-[pulse_7s_ease-in-out_infinite] [animation-delay:1500ms]">
          ⚔
        </span>
        <span className="absolute bottom-[18%] left-[10%] text-[6rem] text-[#7c3aed] animate-[pulse_9s_ease-in-out_infinite] [animation-delay:3000ms]">
          ⚜
        </span>
        <span className="absolute bottom-[6%] right-[6%] text-[8rem] text-[#7c3aed] animate-[pulse_8s_ease-in-out_infinite] [animation-delay:4500ms]">
          ⚔
        </span>
        <span className="absolute left-1/2 top-1/2 text-[18rem] text-[#7c3aed] opacity-30 -translate-x-1/2 -translate-y-1/2 animate-[pulse_10s_ease-in-out_infinite]">
          ☯
        </span>
      </div>

      <div className="pointer-events-none absolute -left-[120px] -top-[120px] h-[320px] w-[320px] rounded-full bg-[#7c3aed]/20 blur-[90px] animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-[100px] -right-[100px] h-[260px] w-[260px] rounded-full bg-[#c9972a]/20 blur-[90px] animate-[pulse_7s_ease-in-out_infinite] [animation-delay:2500ms]" />
      <div className="pointer-events-none absolute right-[15%] top-1/2 h-[220px] w-[220px] rounded-full bg-[#7c3aed]/15 blur-[90px] animate-[pulse_8s_ease-in-out_infinite] [animation-delay:1500ms]" />

      <button
        type="button"
        onClick={() => setTheme(isDark ? "light" : "dark")}
        className="absolute right-6 top-6 z-10 flex items-center gap-2 rounded-full border border-[#7c3aed]/30 bg-[#13101e] px-4 py-2 text-xs font-medium text-[#9b8fc0] transition-colors hover:border-[#7c3aed] hover:text-[#f0ecff] data-[theme=light]:bg-white data-[theme=light]:text-[#5b21b6]"
      >
        <span className="text-sm">{isDark ? "☀" : "☾"}</span>
        <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
      </button>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 flex items-center gap-3">
          <svg
            className="h-12 w-12"
            viewBox="0 0 52 52"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="26"
              cy="26"
              r="24"
              stroke="#c9972a"
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle
              cx="26"
              cy="26"
              r="19"
              stroke="#7c3aed"
              strokeWidth="0.8"
              opacity="0.5"
            />
            <circle cx="26" cy="26" r="13" fill="#1a1628" />
            <path
              d="M26 13 A13 13 0 0 1 26 39 A6.5 6.5 0 0 1 26 26 A6.5 6.5 0 0 0 26 13Z"
              fill="#a855f7"
              opacity="0.8"
            />
            <circle cx="26" cy="19.5" r="2.5" fill="#1a1628" />
            <circle cx="26" cy="32.5" r="2.5" fill="#a855f7" opacity="0.9" />
            <g stroke="#c9972a" strokeWidth="1.2" opacity="0.7">
              <line x1="26" y1="2" x2="26" y2="6" />
              <line x1="26" y1="46" x2="26" y2="50" />
              <line x1="2" y1="26" x2="6" y2="26" />
              <line x1="46" y1="26" x2="50" y2="26" />
              <line x1="8.3" y1="8.3" x2="11.2" y2="11.2" />
              <line x1="40.8" y1="40.8" x2="43.7" y2="43.7" />
              <line x1="43.7" y1="8.3" x2="40.8" y2="11.2" />
              <line x1="11.2" y1="40.8" x2="8.3" y2="43.7" />
            </g>
          </svg>
          <div
            className={`${cinzelClassName} text-sm uppercase tracking-[0.2em] text-[#f0ecff] data-[theme=light]:text-[#1e1033]`}
          >
            Souls In Xtinction
            <span className="mt-1 block text-[0.6rem] font-normal tracking-[0.35em] text-[#5e5480] data-[theme=light]:text-[#7c3aed]">
              Trading Card Game
            </span>
          </div>
        </div>

        <div className="relative w-full max-w-[560px] rounded-[20px] border border-[#7c3aed]/30 bg-[#13101e] px-10 py-12 text-center shadow-[0_0_60px_rgba(124,58,237,0.08)] data-[theme=light]:border-[#7c3aed]/25 data-[theme=light]:bg-white">
          <div className="absolute left-[15%] right-[15%] top-0 h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,#c9972a,#f0be5e,#c9972a,transparent)]" />

          <div className="relative mx-auto mb-6 h-[90px] w-[90px]">
            <svg
              className="h-full w-full animate-spin"
              viewBox="0 0 90 90"
              fill="none"
            >
              <path
                d="M45 28a17 17 0 1 1 0 34 17 17 0 0 1 0-34z"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2"
                opacity="0.5"
              />
              <path
                d="M38 10h14l2 8a24 24 0 0 1 6 3.5l8-2 7 12-6 6a24 24 0 0 1 0 7l6 6-7 12-8-2a24 24 0 0 1-6 3.5l-2 8H38l-2-8a24 24 0 0 1-6-3.5l-8 2-7-12 6-6a24 24 0 0 1 0-7l-6-6 7-12 8 2A24 24 0 0 1 36 18z"
                fill="none"
                stroke="#c9972a"
                strokeWidth="1.8"
                strokeLinejoin="round"
                opacity="0.8"
              />
            </svg>
            <svg
              className="absolute left-1/2 top-1/2 h-[34px] w-[34px] -translate-x-1/2 -translate-y-1/2 animate-spin [animation-direction:reverse]"
              viewBox="0 0 34 34"
              fill="none"
            >
              <path
                d="M14.5 4h5l.8 3a9 9 0 0 1 2.2 1.3l3-.8 2.5 4.3-2.2 2.2a9 9 0 0 1 0 2.6l2.2 2.2-2.5 4.3-3-.8a9 9 0 0 1-2.2 1.3l-.8 3h-5l-.8-3a9 9 0 0 1-2.2-1.3l-3 .8-2.5-4.3 2.2-2.2a9 9 0 0 1 0-2.6l-2.2-2.2 2.5-4.3 3 .8A9 9 0 0 1 13.7 7z"
                fill="none"
                stroke="#a855f7"
                strokeWidth="1.5"
                strokeLinejoin="round"
                opacity="0.9"
              />
              <circle cx="17" cy="17" r="4" fill="#7c3aed" opacity="0.6" />
            </svg>
          </div>

          <h1
            className={`${cinzelClassName} text-2xl font-bold tracking-wide text-[#f0ecff] data-[theme=light]:text-[#1e1033] sm:text-3xl`}
          >
            Servidor en{" "}
            <span className="text-[#f0be5e] data-[theme=light]:text-[#b45309]">
              Mantenimiento
            </span>
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#9b8fc0] data-[theme=light]:text-[#5b21b6]">
            Portal temporalmente fuera de servicio
          </p>

          <div className="mx-auto my-8 flex max-w-[320px] items-center gap-3">
            <span className="h-px flex-1 bg-[#7c3aed]/30" />
            <span className="h-2 w-2 rotate-45 bg-[#c9972a]" />
            <span className="h-px flex-1 bg-[#7c3aed]/30" />
          </div>

          <p className="text-sm leading-relaxed text-[#9b8fc0] data-[theme=light]:text-[#5b21b6]">
            Estamos forjando mejoras para tu experiencia en el campo de batalla.
            <br />
            El portal de{" "}
            <span className="font-semibold text-[#f0ecff] data-[theme=light]:text-[#1e1033]">
              Souls In Xtinction
            </span>{" "}
            volvera pronto con nuevas cartas, mazos y torneos. Prepara tu
            estrategia.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              {
                label: "Portal web",
                value: "En mantenimiento",
                color: "bg-[#f59e0b]",
                glow: "shadow-[0_0_8px_rgba(245,158,11,0.5)]",
              },
              {
                label: "Base de cartas",
                value: "Operativa",
                color: "bg-[#22c55e]",
                glow: "shadow-[0_0_8px_rgba(34,197,94,0.5)]",
              },
              {
                label: "Torneos",
                value: "En pausa",
                color: "bg-[#a855f7]",
                glow: "shadow-[0_0_8px_rgba(168,85,247,0.5)]",
              },
              {
                label: "Redes sociales",
                value: "Activas",
                color: "bg-[#60a5fa]",
                glow: "shadow-[0_0_8px_rgba(96,165,250,0.5)]",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-[#7c3aed]/30 bg-[#1a1628] px-4 py-3 text-left data-[theme=light]:border-[#7c3aed]/25 data-[theme=light]:bg-[#ede9fe]"
              >
                <span className={`h-2 w-2 rounded-full ${item.color} ${item.glow}`} />
                <div>
                  <span className="block text-[0.7rem] uppercase tracking-[0.18em] text-[#5e5480] data-[theme=light]:text-[#7c3aed]">
                    {item.label}
                  </span>
                  <span className="block text-sm font-medium text-[#f0ecff] data-[theme=light]:text-[#1e1033]">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <div className="mb-2 flex items-center justify-between text-[0.7rem] uppercase tracking-[0.18em] text-[#5e5480] data-[theme=light]:text-[#7c3aed]">
              <span>Progreso de restauracion</span>
              <span
                className={`${cinzelClassName} text-[0.8rem] text-[#f0be5e] data-[theme=light]:text-[#b45309]`}
              >
                72%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full border border-[#7c3aed]/30 bg-[#1a1628] data-[theme=light]:border-[#7c3aed]/25 data-[theme=light]:bg-[#ede9fe]">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#c9972a] transition-all duration-[1200ms] ${
                  progressReady ? "w-[72%]" : "w-0"
                }`}
              />
            </div>
          </div>

          <div className="mx-auto my-8 flex max-w-[320px] items-center gap-3">
            <span className="h-px flex-1 bg-[#7c3aed]/30" />
            <span className="h-2 w-2 rotate-45 bg-[#c9972a]" />
            <span className="h-px flex-1 bg-[#7c3aed]/30" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/soulsinxtinction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-[#7c3aed]/30 bg-[#1a1628] px-4 py-2 text-xs font-medium text-[#9b8fc0] transition hover:border-[#7c3aed] hover:text-[#f0ecff] data-[theme=light]:border-[#7c3aed]/25 data-[theme=light]:bg-[#ede9fe] data-[theme=light]:text-[#5b21b6]"
            >
              <span className="text-[0.65rem] font-semibold">IG</span> Instagram
            </a>
            <a
              href="https://discord.gg/soulsinxtinction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-[#7c3aed]/30 bg-[#1a1628] px-4 py-2 text-xs font-medium text-[#9b8fc0] transition hover:border-[#7c3aed] hover:text-[#f0ecff] data-[theme=light]:border-[#7c3aed]/25 data-[theme=light]:bg-[#ede9fe] data-[theme=light]:text-[#5b21b6]"
            >
              <span className="text-[0.65rem] font-semibold">DC</span> Discord
            </a>
            <a
              href="https://www.youtube.com/@soulsinxtinction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-[#7c3aed]/30 bg-[#1a1628] px-4 py-2 text-xs font-medium text-[#9b8fc0] transition hover:border-[#7c3aed] hover:text-[#f0ecff] data-[theme=light]:border-[#7c3aed]/25 data-[theme=light]:bg-[#ede9fe] data-[theme=light]:text-[#5b21b6]"
            >
              <span className="text-[0.65rem] font-semibold">YT</span> YouTube
            </a>
          </div>
        </div>

        <p className="mt-10 text-[0.7rem] uppercase tracking-[0.25em] text-[#5e5480] data-[theme=light]:text-[#7c3aed]">
          (c) 2026{" "}
          <a href="https://www.soulsinxtinction.com" className="text-[#a855f7]">
            soulsinxtinction.com
          </a>{" "}
          - TCG Colombiano
        </p>
      </div>
    </div>
  );
}
