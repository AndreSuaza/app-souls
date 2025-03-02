'use client';

import Link from "next/link"
import { IoSearchOutline } from "react-icons/io5"
import { titleFont } from "@/config/fonts"
import { useUIStore } from "@/store";

export const TopMenu = () => {

  const openMenu = useUIStore( state => state.openSideMenu );
  

  return (
    <nav className="flex px-5 justify-between items-center w-full">
        {/* Logo */}
        <div>
            <Link href="/">
                <span className={`${ titleFont.className } antialiased font-bold`}> Souls In Xtinction</span>
                <span> | TCG </span>
            </Link>
        </div>
        <div className="hidden sm:block">
          <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/como-jugar">Como Jugar</Link>
          <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/productos">Productos</Link>
          <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/eventos">Eventos</Link>
          <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/laboratorio">Laboratorio</Link>
          <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/tiendas">Tiendas</Link>
          <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/boveda">Boveda</Link>
          <Link className="m-2 p-2 rounded-md transition-all hover:bg-gray-100" href="/noticias">Noticias</Link>
        </div>
        
        {/*Search, Menu*/}
        <div className="flex items-center">
          <Link href="/search">
            <IoSearchOutline className="w-5 h-5"/>
          </Link>
          <button 
            className="m-2 p-2 rounded-md transition-all hover:bg-gray-100"
            onClick={openMenu}
          >
            Menú
          </button>
        </div>
        
    </nav>
  )
}
