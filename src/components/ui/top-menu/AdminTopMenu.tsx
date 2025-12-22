"use client";

import Link from "next/link";
import Image from "next/image";
import { IoCloseOutline, IoMenuOutline } from "react-icons/io5";
import { titleFont } from "@/config/fonts";
import { useUIStore } from "@/store";

export const AdminTopMenu = () => {
  const isOpen = useUIStore((state) => state.isTournamentSidebarOpen);
  const open = useUIStore((state) => state.openTournamentSidebar);
  const close = useUIStore((state) => state.closeTournamentSidebar);

  return (
    <nav className="flex items-center justify-between w-full bg-gray-950 text-white px-4 py-3 md:hidden">
      <Link href="/">
        <div className="flex items-center">
          <Image
            src="/souls-in-xtinction-logo-sm.png"
            alt="logo-icono-souls-in-xtinction"
            className="w-10 h-10"
            width={40}
            height={40}
          />
          <span
            className={`${titleFont.className} antialiased font-bold ml-2 text-sm`}
          >
            Souls In Xtinction | TCG
          </span>
        </div>
      </Link>

      <button
        className="p-2 rounded-md transition-all hover:bg-white/10"
        onClick={isOpen ? close : open}
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? <IoCloseOutline size={22} /> : <IoMenuOutline size={22} />}
      </button>
    </nav>
  );
};
