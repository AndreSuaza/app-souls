'use client';

import Link from "next/link"
import { IoLogoFacebook, IoLogoInstagram, IoLogoTiktok, IoLogoYoutube, IoMenuSharp, IoSearchOutline } from "react-icons/io5"
import { titleFont } from "@/config/fonts"
import { useUIStore } from "@/store";
import Image from "next/image";

export const TopMenu = () => {

  const openMenu = useUIStore( state => state.openSideMenu );
  

  return (
    <nav className="flex px-5 justify-between items-center w-full bg-slate-950 text-white py-4 lg:px-40">
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
        <div className="hidden sm:block">
          <Link className="m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/como-jugar">Como Jugar</Link>
          <Link className="m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/torneos">Torneos</Link>
          <Link className="m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/laboratorio">Laboratorio</Link>
          <Link className="m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/productos">Productos</Link>
          <Link className="m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/tiendas">Tiendas</Link>
          <Link className="m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/boveda">Boveda</Link>
        </div>
        
        {/*Search, Menu*/}
        <div className="items-center hidden sm:block">
          <div className="flex flex-row">
            <IoLogoInstagram className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
            <IoLogoFacebook className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
            <IoLogoYoutube className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
            <IoLogoTiktok className="w-6 h-6 ml-4 transition-all hover:text-yellow-600"/>
          </div> 
        </div>
        <div className="block sm:hidden">
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
