import { titleFont } from "@/config/fonts";
import { Routes } from "@/models/routes.models";
import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTiktok, FaWhatsapp } from "react-icons/fa";

export const Footer = () => {
  const navigationLinks = Routes.filter((route) =>
    ["Jugar", "Noticias", "Torneos", "Productos"].includes(route.name),
  );
  const resourceLinks = Routes.filter((route) =>
    ["Cartas", "Mazos", "Productos"].includes(route.name),
  );

  return (
    <footer className="relative overflow-hidden border-t-2 border-tournament-dark-border bg-tournament-dark-surface text-slate-300">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(88,76,228,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(88,76,228,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />
      <div className="relative mx-auto w-full max-w-7xl px-6 pb-10 pt-16">
        <div className="grid grid-cols-1 gap-6 lg:gap-12 md:grid-cols-12">
          <div className="space-y-6 md:col-span-4">
            <Link
              href="/"
              title="Ir al inicio"
              className="inline-flex items-center gap-4"
            >
              <div className="relative">
                <Image
                  src="/global/RuedaSouls.svg"
                  alt="Logo Souls In Xtinction"
                  title="Souls In Xtinction"
                  width={64}
                  height={64}
                  className="h-16 w-16 drop-shadow-[0_0_8px_rgba(88,76,228,0.6)]"
                />
                <div className="absolute inset-0 -z-10 rounded-full bg-purple-500/20 blur-xl" />
              </div>
              <div>
                <h2
                  className={`${titleFont.className} text-lg font-bold tracking-wider text-white`}
                >
                  SOULS IN XTINCTION
                </h2>
                <p className="text-xs font-bold tracking-[0.2em] text-purple-400">
                  TRADING CARD GAME
                </p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed text-slate-400">
              Para más información, consultas o colaboraciones, no dudes en
              escribirnos. Nuestro equipo de soporte está listo para asistirte
              en el campo de batalla.
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-purple-400">
              <span className="h-2 w-2 rotate-45 bg-purple-400" />
              Navegación
            </h3>
            <ul className="space-y-4 text-sm font-semibold uppercase tracking-wider">
              {navigationLinks.map((route) =>
                route.menu
                  ? route.menu.map((menu) =>
                      menu.path ? (
                        <li key={menu.name}>
                          <Link
                            href={menu.path}
                            title={`Ir a ${menu.name}`}
                            className="inline-flex items-center gap-2 transition hover:translate-x-2 hover:text-purple-400"
                          >
                            {menu.name}
                          </Link>
                        </li>
                      ) : null,
                    )
                  : route.path && (
                      <li key={route.name}>
                        <Link
                          href={route.path}
                          title={`Ir a ${route.name}`}
                          className="inline-flex items-center gap-2 transition hover:translate-x-2 hover:text-purple-400"
                        >
                          {route.name}
                        </Link>
                      </li>
                    ),
              )}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-purple-400">
              <span className="h-2 w-2 rotate-45 bg-purple-400" />
              Recursos TCG
            </h3>
            <ul className="space-y-4 text-sm font-semibold uppercase tracking-wider">
              {resourceLinks.map((route) =>
                route.menu
                  ? route.menu.map((menu) =>
                      menu.path ? (
                        <li key={menu.name}>
                          <Link
                            href={menu.path}
                            title={`Ir a ${menu.name}`}
                            className="inline-flex items-center gap-2 transition hover:translate-x-2 hover:text-purple-400"
                          >
                            {menu.name}
                          </Link>
                        </li>
                      ) : null,
                    )
                  : route.path && (
                      <li key={route.name}>
                        <Link
                          href={route.path}
                          title={`Ir a ${route.name}`}
                          className="inline-flex items-center gap-2 transition hover:translate-x-2 hover:text-purple-400"
                        >
                          {route.name}
                        </Link>
                      </li>
                    ),
              )}
            </ul>
          </div>

          <div className="md:col-span-2">
            <h3 className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.3em] text-purple-400">
              <span className="h-2 w-2 rotate-45 bg-purple-400" />
              Comunidad
            </h3>
            <div className="grid w-max grid-cols-2 gap-2">
              <Link
                href="https://www.instagram.com/soulsinxtinction"
                target="_blank"
                rel="noopener noreferrer"
                title="Instagram"
                className="group flex h-14 w-14 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 transition hover:-translate-y-1 hover:bg-purple-500 hover:text-white hover:shadow-[0_0_15px_rgba(88,76,228,0.5)]"
              >
                <FaInstagram className="h-6 w-6 opacity-80 group-hover:opacity-100" />
              </Link>
              <Link
                href="https://www.tiktok.com/@soulsinxtinction"
                target="_blank"
                rel="noopener noreferrer"
                title="TikTok"
                className="group flex h-14 w-14 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 transition hover:-translate-y-1 hover:bg-purple-500 hover:text-white hover:shadow-[0_0_15px_rgba(88,76,228,0.5)]"
              >
                <FaTiktok className="h-6 w-6 opacity-80 group-hover:opacity-100" />
              </Link>
              <Link
                href="https://www.facebook.com/soulsinxtinction"
                target="_blank"
                rel="noopener noreferrer"
                title="Facebook"
                className="group flex h-14 w-14 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 transition hover:-translate-y-1 hover:bg-purple-500 hover:text-white hover:shadow-[0_0_15px_rgba(88,76,228,0.5)]"
              >
                <FaFacebookF className="h-6 w-6 opacity-80 group-hover:opacity-100" />
              </Link>
              <Link
                href="https://wa.me/573180726340"
                target="_blank"
                rel="noopener noreferrer"
                title="WhatsApp"
                className="group flex h-14 w-14 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/50 transition hover:-translate-y-1 hover:bg-purple-500 hover:text-white hover:shadow-[0_0_15px_rgba(88,76,228,0.5)]"
              >
                <FaWhatsapp className="h-6 w-6 opacity-80 group-hover:opacity-100" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-tournament-dark-border/50 pt-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-[10px] uppercase tracking-widest text-slate-500 leading-relaxed">
              La reproducción de imágenes, textos y datos de este sitio web está
              prohibida sin autorización. Es importante tener en cuenta que las
              imágenes aquí mostradas pueden no reflejar fielmente el producto
              final, dado que este aún se encuentra en fase de desarrollo.
            </p>
            <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">
              © {new Date().getFullYear()} Souls In Xtinction
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
