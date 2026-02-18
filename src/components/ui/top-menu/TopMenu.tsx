"use client";

import Link from "next/link";
import { titleFont } from "@/config/fonts";
import { useUIStore } from "@/store";
import Image from "next/image";
import { Routes } from "@/models/routes.models";
import { useEffect, useRef, useState } from "react";
import { IoMenuSharp } from "react-icons/io5";
import { signOut, useSession } from "next-auth/react";

export const TopMenu = () => {
  const openMenu = useUIStore((state) => state.openSideMenu);
  const [open, setOpen] = useState<boolean>(false);
  const [openProfile, setOpenProfile] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const dropdownRefProfile = useRef<HTMLDivElement | null>(null);

  const { data: session } = useSession();
  const adminShortcut = (() => {
    const role = session?.user?.role;
    if (role === "admin") {
      return { label: "Administrar", href: "/admin" };
    }
    if (role === "store") {
      return { label: "Torneos", href: "/admin/torneos" };
    }
    if (role === "news") {
      return { label: "Noticias", href: "/admin/noticias" };
    }
    return null;
  })();

  const handleClick = async () => {
    await signOut();
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    function handleClickOutsideProfile(event: MouseEvent) {
      if (
        dropdownRefProfile.current &&
        !dropdownRefProfile.current.contains(event.target as Node)
      ) {
        setOpenProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideProfile);
    return () =>
      document.removeEventListener("mousedown", handleClickOutsideProfile);
  }, []);

  return (
    <nav className="flex px-5 justify-between items-center w-full bg-gray-950 text-white py-3">
      {/* Logo */}

      <Link href="/">
        <div className="flex flex-grow">
          <Image
            src={`/souls-in-xtinction-logo-sm.png`}
            alt={"logo-icono-souls-in-xtinction"}
            className="w-12 h-12"
            width={40}
            height={40}
          />
          <span
            className={`${titleFont.className} antialiased font-bold my-auto ml-2 text-xl`}
          >
            {" "}
            Souls In Xtinction | TCG
          </span>
        </div>
      </Link>

      <div className="hidden lg:block lg:text-xs xl:text-base">
        <ul className="flex">
          {Routes.map((route) => (
            <li key={route.name}>
              {route.menu ? (
                <div
                  className="relative inline-block text-left"
                  ref={dropdownRef}
                >
                  {/* Botón */}
                  <a
                    onMouseEnter={() => setOpen(!open)}
                    className="m-2 xl:p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
                  >
                    {route.name}
                  </a>

                  {/* Menú */}
                  {open && (
                    <ul
                      onMouseLeave={() => setOpen(!open)}
                      className="absolute mt-6 w-56 bg-gray-950 shadow-lg ring-1 ring-white/10 focus:outline-none transition-transform duration-150 scale-100 z-50"
                    >
                      {route.menu.map((menu) => (
                        <li key={menu.name}>
                          <Link
                            href={menu.path}
                            className="m-2 xl:p-2 transition-all uppercase font-bold flex flex-col hover:text-yellow-600"
                          >
                            {menu.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={route.path}
                  className="m-2 xl:p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
                >
                  {route.name}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/*Search, Menu*/}
      <div className="items-center hidden lg:block">
        {session ? (
          <div
            className="relative inline-block text-left"
            ref={dropdownRefProfile}
          >
            {/* Botón */}
            <a
              onMouseEnter={() => setOpenProfile(!openProfile)}
              className="flex flex-grow bg-slate-900 py-2 px-3 rounded hover:bg-slate-800 transition-all"
            >
              {session?.user.image && (
                <>
                  <Image
                    src={`/profile/${session?.user.image}.webp`}
                    alt="Imagen de perfil"
                    className="w-8 rounded-full mr-2"
                    width={80}
                    height={80}
                  />
                  <p className="uppercase font-semibold mt-1">
                    {session?.user.nickname}
                  </p>
                </>
              )}
            </a>

            {/* Menú */}
            {openProfile && (
              <ul
                onMouseLeave={() => setOpenProfile(!openProfile)}
                className="absolute font-sem pt-2 pb-2 px-2 w-36 rounded-md bg-gray-950 shadow-lg ring-1 ring-white/10 focus:outline-none transition-transform duration-150 scale-100 z-50"
              >
                <li>
                  <Link
                    href="/perfil"
                    className="block w-full h-full mb-2 mt-2 p-1 hover:bg-gray-800 transition-transform"
                  >
                    Tu perfil
                  </Link>
                </li>
                {adminShortcut && (
                  <li>
                    <Link
                      href={adminShortcut.href}
                      className="block w-full h-full mb-2 mt-2 p-1 hover:bg-gray-800 transition-transform"
                    >
                      {adminShortcut.label}
                    </Link>
                  </li>
                )}
                <li>
                  <button
                    onClick={handleClick}
                    className="block w-full h-full text-left mb-2 mt-2 p-1 hover:bg-gray-800 transition-transform"
                  >
                    Cerrar sesión
                  </button>
                </li>
              </ul>
            )}
          </div>
        ) : (
          <Link
            href={"/auth/login"}
            className="uppercase font-semibold bg-yellow-600 px-4 py-2 rounded text-sm hover:bg-yellow-700 transition-all"
          >
            iniciar sesión
          </Link>
        )}
      </div>

      <div className="block lg:hidden">
        <button
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
          onClick={openMenu}
        >
          <IoMenuSharp className="w-6 h-6" />
        </button>
      </div>
    </nav>
  );
};
