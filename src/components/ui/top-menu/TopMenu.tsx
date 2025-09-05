'use client';

import Link from "next/link"
import { IoLogoFacebook, IoLogoInstagram, IoLogoTiktok, IoLogoYoutube, IoMenuSharp } from "react-icons/io5"
import { titleFont } from "@/config/fonts"
import { useUIStore } from "@/store";
import Image from "next/image";
import { Routes } from "@/models/routes.models";
import { useEffect, useRef, useState } from "react";

export const TopMenu = () => {

  const openMenu = useUIStore( state => state.openSideMenu );
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex px-5 justify-between items-center w-full bg-slate-950 text-white py-4">
        {/* Logo */}
        <div>
            <Link href="/">
                <div className="flex flex-grow">
                <Image
                    src={`/souls-in-xtinction-logo-sm.png`}
                    alt={'logo-icono-souls-in-xtinction'}
                    className='w-12 h-12'
                    width={40}
                    height={40}
                />
                <span className={`${ titleFont.className } antialiased font-bold my-auto ml-2`}> Souls In Xtinction | TCG</span>
                </div>
            </Link>
        </div>
        <div className="hidden lg:block lg:text-xs xl:text-base">
          <ul className="flex">
          {Routes.map((route) => (
            <li key={route.name}>
              {route.menu ? 
           
              <div className="relative inline-block text-left" ref={dropdownRef}>
                {/* Botón */}
                <a
                  onMouseEnter={() => setOpen(!open)}
                  className="m-2 xl:p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
                >
                  {route.name}
                </a>

                {/* Menú */}
                {open && (
                  <div 
                  onMouseLeave={() => setOpen(!open)}
                  className="absolute mt-6 w-56 bg-slate-950 shadow-lg ring-1 ring-white/10 focus:outline-none transition-transform duration-150 scale-100 z-50">
                    {route.menu.map((menu) => (
                              <Link
                                key={menu.name}
                                href={menu.path}
                                className="m-2 xl:p-2 transition-all uppercase flex flex-col font-bold hover:text-yellow-600"
                              >
                                {menu.name}
                              </Link>
                            ))}
                  </div>
                )}
              </div>

            :

            <Link
                href={route.path}
                className="m-2 xl:p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
              >
                {route.name}
            </Link>
            }
            </li>
            ))}
          </ul>
       </div>
        
        {/*Search, Menu*/}
        <div className="items-center hidden lg:block">
          <div className="flex flex-row">
            <Link href="https://www.instagram.com/soulsinxtinction" target="blank">
              <IoLogoInstagram className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
            </Link>
              <Link href="https://www.facebook.com/soulsinxtinction" target="blank">
            <IoLogoFacebook className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
              </Link>
            <Link href="https://www.youtube.com/@SoulsInXtinction" target="blank">
              <IoLogoYoutube className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
            </Link>
            <Link href="https://www.tiktok.com/@soulsinxtinction" target="blank">
              <IoLogoTiktok className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
            </Link>
          </div> 
        </div>
        <div className="block lg:hidden">
          <button 
            className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
            onClick={openMenu}
          >
            <IoMenuSharp className="w-6 h-6"/>
          </button>
        </div>
    </nav>
    // <nav className="bg-black text-white font-sans">
    //   {/* Menú principal */}
    //   <div className="flex justify-between items-center px-6 py-3 border-b border-orange-600">
    //     {/* Logo */}
    //     <div className="flex items-center gap-2">
    //       <span className="text-xl font-bold text-orange-500">MAGIC</span>
    //       <span className="text-sm">THE GATHERING</span>
    //     </div>

    //     {/* Opciones */}
    //     <ul className="flex gap-6">
    //       <li
    //         className="relative cursor-pointer"
    //         onMouseEnter={() => setOpen(true)}
    //         onMouseLeave={() => setOpen(false)}
    //       >
    //         <span className="text-orange-500 font-semibold border-b-2 border-orange-500">
    //           PRODUCTOS
    //         </span>

    //         {/* Submenú */}
    //         {open && (
    //           <div className="absolute top-8 left-0 bg-black text-white shadow-lg p-6 grid grid-cols-2 gap-8 w-[500px] z-50">
    //             {/* Próximamente */}
    //             <div>
    //               <h3 className="text-orange-500 font-bold mb-2">PRÓXIMAMENTE</h3>
    //               <ul className="space-y-1">
    //                 <li>Marvel’s Spider-Man</li>
    //                 <li>Avatar: La leyenda de Aang</li>
    //                 <li>Lorwyn eclipsado</li>
    //               </ul>
    //             </div>

    //             {/* Ya disponible */}
    //             <div>
    //               <h3 className="text-orange-500 font-bold mb-2">YA DISPONIBLE</h3>
    //               <ul className="space-y-1">
    //                 <li>El Confín de la Eternidad</li>
    //                 <li>Magic: The Gathering—FINAL FANTASY</li>
    //                 <li>Tarkir: tormenta dracónica</li>
    //                 <li>Cimientos</li>
    //                 <li>Festival in a Box</li>
    //                 <li>Secret Lair Drop Series</li>
    //                 <li className="font-bold">Productos más recientes</li>
    //                 <li className="font-bold">Archivo de colecciones de MTG</li>
    //               </ul>
    //             </div>
    //           </div>
    //         )}
    //       </li>

    //       <li className="cursor-pointer hover:text-orange-500">MTG ARENA</li>
    //       <li className="cursor-pointer hover:text-orange-500">JUGAR A MAGIC</li>
    //       <li className="cursor-pointer hover:text-orange-500">EXPLORAR MAGIC</li>
    //       <li className="cursor-pointer hover:text-orange-500">TIENDA</li>
    //       <li className="cursor-pointer hover:text-orange-500">ARTÍCULOS</li>
    //     </ul>

    //     {/* Iconos lado derecho */}
    //     <div className="flex gap-6 text-sm">
    //       <span className="cursor-pointer hover:text-orange-500">LOCALIZADOR</span>
    //       <span className="cursor-pointer hover:text-orange-500">BASE DE DATOS DE CARTAS</span>
    //       <span className="cursor-pointer hover:text-orange-500">CUENTAS</span>
    //     </div>
    //   </div>
    // </nav>
  )
}
