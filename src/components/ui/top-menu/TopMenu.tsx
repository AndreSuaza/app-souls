'use client';

import Link from "next/link"
import { IoLogoFacebook, IoLogoInstagram, IoLogoTiktok, IoLogoYoutube, IoMenuSharp } from "react-icons/io5"
import { titleFont } from "@/config/fonts"
import { useUIStore } from "@/store";
import Image from "next/image";
import { Routes } from "@/models/routes.models";

export const TopMenu = () => {

  const openMenu = useUIStore( state => state.openSideMenu );
  

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
          {Routes.map((route) => (
  
              <Link
                key={route.name}
                href={route.path}
                className="m-2 xl:p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600"
              >
                {route.name}
              </Link>
            
            ))}
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
  )
}
