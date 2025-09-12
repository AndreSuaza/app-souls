'use client';

import Link from "next/link"
import { titleFont } from "@/config/fonts"
import { useUIStore } from "@/store";
import Image from "next/image";
import { Routes } from "@/models/routes.models";
import { useEffect, useRef, useState } from "react";
import { IoLogoFacebook, IoLogoInstagram, IoLogoTiktok, IoLogoYoutube, IoMenuSharp } from "react-icons/io5";
import { useSession } from "next-auth/react";
import { ButtonLogOut } from "@/components/login/button-logout";

export const TopMenu = () => {

  const openMenu = useUIStore( state => state.openSideMenu );
  const [open, setOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  
  const { data: session } = useSession();

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
    <nav className="flex px-5 justify-between items-center w-full bg-gray-950 text-white py-3">
        {/* Logo */}

        <Link href="/">
            <div className="flex flex-grow">
            <Image
                src={`/souls-in-xtinction-logo-sm.png`}
                alt={'logo-icono-souls-in-xtinction'}
                className='w-12 h-12'
                width={40}
                height={40}
            />
            <span className={`${ titleFont.className } antialiased font-bold my-auto ml-2 text-xl`}> Souls In Xtinction | TCG</span>
            </div>
        </Link>
  
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
                  <ul 
                  onMouseLeave={() => setOpen(!open)}
                  className="absolute mt-6 w-56 bg-gray-950 shadow-lg ring-1 ring-white/10 focus:outline-none transition-transform duration-150 scale-100 z-50">
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
        { session?.user 
          ?
          <ButtonLogOut className="flex bg-slate-800 pt-2 px-3 rounded-md pb-1 hover:bg-blue-800">
            
            <span className="capitalize mr-2 font-semibold">Cerrar sesion</span>
            <Image
                src={session?.user.image ? session?.user.image : `/souls-in-xtinction-logo-sm.png`}
                alt="Imagen de perfil"
                className='size-8 rounded-full -mt-1'
                width={8}
                height={8}
            />
          </ButtonLogOut>
          :
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
        }
        

        <div className="block lg:hidden">
          <button 
            className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
            onClick={openMenu}
          >
            <IoMenuSharp className="w-6 h-6"/>
          </button>
        </div>
    </nav>
  )
}
