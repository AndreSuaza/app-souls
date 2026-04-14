"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import { titleFont } from "@/config/fonts";

interface MaintenanceViewProps {
  cinzelClassName: string;
  interClassName: string;
}

export function MaintenanceView({
  cinzelClassName,
  interClassName,
}: MaintenanceViewProps) {
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/mantenimiento" });
  };

  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-tournament-dark-bg dark:text-slate-100 ${interClassName}`}
    >
      <div className="pointer-events-none absolute -left-[120px] -top-[120px] h-[320px] w-[320px] rounded-full bg-purple-500/15 blur-[90px] animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute -bottom-[100px] -right-[100px] h-[260px] w-[260px] rounded-full bg-amber-500/15 blur-[90px] animate-[pulse_7s_ease-in-out_infinite] [animation-delay:2500ms]" />
      <div className="pointer-events-none absolute right-[15%] top-1/2 h-[220px] w-[220px] rounded-full bg-purple-500/10 blur-[90px] animate-[pulse_8s_ease-in-out_infinite] [animation-delay:1500ms]" />

      {session ? (
        <button
          type="button"
          title="Cerrar sesión"
          onClick={handleSignOut}
          className="absolute right-6 top-6 z-50 cursor-pointer rounded bg-yellow-600 px-4 py-2 text-sm font-semibold uppercase text-slate-900 shadow-sm transition-all hover:bg-yellow-700"
        >
          Cerrar sesión
        </button>
      ) : (
        <Link
          href="/auth/login"
          title="Iniciar sesión"
          className="absolute right-6 top-6 z-50 cursor-pointer rounded bg-yellow-600 px-4 py-2 text-sm font-semibold uppercase text-slate-900 shadow-sm transition-all hover:bg-yellow-700"
        >
          Iniciar sesión
        </Link>
      )}

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mb-10 flex items-center gap-4">
          <div className="relative">
            <Image
              src="/global/RuedaSouls.svg"
              alt="Logo Souls In Xtinction"
              title="Souls In Xtinction"
              width={64}
              height={64}
              className="h-14 w-14 drop-shadow-[0_0_8px_rgba(88,76,228,0.6)]"
            />
            <div className="absolute inset-0 -z-10 rounded-full bg-purple-500/25 blur-xl" />
          </div>
          <div>
            <h2
              className={`${titleFont.className} text-lg font-bold tracking-wider text-slate-900 dark:text-white`}
            >
              SOULS IN XTINCTION
            </h2>
            <p className="text-xs font-bold tracking-[0.2em] text-purple-600 dark:text-purple-400">
              TRADING CARD GAME
            </p>
          </div>
        </div>

        <div className="relative w-full max-w-[560px] rounded-[20px] border border-slate-200 bg-white/90 px-10 py-12 text-center shadow-[0_0_60px_rgba(88,76,228,0.15)] backdrop-blur dark:border-tournament-dark-border dark:bg-tournament-dark-surface/95">
          <div className="absolute left-[15%] right-[15%] top-0 h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,#fbbf24,#f59e0b,#fbbf24,transparent)]" />

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
            <div className="maintenance-orbit">
              <svg
                className="h-[34px] w-[34px] animate-spin [animation-direction:reverse]"
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
          </div>

          <h1
            className={`${cinzelClassName} text-2xl font-bold tracking-wide text-slate-900 dark:text-white sm:text-3xl`}
          >
            Servidor en{" "}
            <span className="text-amber-500 dark:text-amber-400">
              Mantenimiento
            </span>
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.35em] text-purple-600/80 dark:text-purple-300/80">
            Portal temporalmente fuera de servicio
          </p>

          <div className="mx-auto my-8 flex max-w-[320px] items-center gap-3">
            <span className="h-px flex-1 bg-purple-500/20" />
            <span className="h-2 w-2 rotate-45 bg-amber-500" />
            <span className="h-px flex-1 bg-purple-500/20" />
          </div>

          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            Estamos forjando mejoras para tu experiencia en el campo de batalla.
            <br />
            El portal de{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
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
                value: "En actualizacion",
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
                className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-white/80 px-4 py-3 text-left dark:border-tournament-dark-border dark:bg-tournament-dark-muted"
              >
                <span
                  className={`h-2 w-2 rounded-full ${item.color} ${item.glow}`}
                />
                <div>
                  <span className="block text-[0.7rem] uppercase tracking-[0.18em] text-purple-600/70 dark:text-purple-300/70">
                    {item.label}
                  </span>
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto my-8 flex max-w-[320px] items-center gap-3">
            <span className="h-px flex-1 bg-purple-500/20" />
            <span className="h-2 w-2 rotate-45 bg-amber-500" />
            <span className="h-px flex-1 bg-purple-500/20" />
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <a
              href="https://www.instagram.com/soulsinxtinction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-purple-500 hover:text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:text-white"
            >
              <FaInstagram className="h-4 w-4" />
              Instagram
            </a>
            <a
              href="https://www.tiktok.com/@soulsinxtinction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-purple-500 hover:text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:text-white"
            >
              <FaTiktok className="h-4 w-4" />
              TikTok
            </a>
            <a
              href="https://www.facebook.com/soulsinxtinction"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg border border-purple-500/20 bg-white/80 px-4 py-2 text-xs font-medium text-slate-600 transition hover:border-purple-500 hover:text-slate-900 dark:border-tournament-dark-border dark:bg-tournament-dark-muted dark:text-slate-300 dark:hover:text-white"
            >
              <FaFacebookF className="h-4 w-4" />
              Facebook
            </a>
          </div>
        </div>

        <p className="mt-10 text-center text-[0.7rem] uppercase tracking-[0.25em] text-purple-600/70 dark:text-purple-300/70">
          © {new Date().getFullYear()}{" "}
          <a
            href="https://www.soulsinxtinction.com"
            className="text-purple-500 hover:text-purple-600 dark:text-purple-300"
          >
            soulsinxtinction.com
          </a>{" "}
          - TCG Colombiano
        </p>
      </div>
    </div>
  );
}
