'use client';

import { useUIStore } from '@/store';
import clsx from 'clsx';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { IoBagRemoveOutline, IoBookOutline, IoCloseOutline, IoDiamondOutline, IoFlashOutline, IoFlaskOutline, IoLayers, IoLogoFacebook, IoLogoInstagram, IoLogoTiktok, IoLogoYoutube, IoStorefrontOutline } from 'react-icons/io5';


export const Sidebar = () => {

  const isSideMenuOpen = useUIStore( state => state.isSideMenuOpen);
  const closeMenu = useUIStore( state => state.closeSideMenu );
  const { data: session } = useSession();

    const handleClick = async() => {
        await signOut();
    }

  return (
    <div>
        {/* Background black*/}
        {
            isSideMenuOpen && (
                <div
                    className="fixed top-0 left-0 w-screen h-screen z-20 bg-black opacity-30"
                />
            )
        }
        
        {
            isSideMenuOpen && (
                <div 
                    onClick={ closeMenu }
                    className="fade-in fixed top-0 left-0 w-screen h-screen z-20 backdrop-filter backdrop-blur-sm"
                />
            )
        }

        

        {/* Sidemenu */}
        <nav className={
            clsx(
                "fixed p-5 right-0 top-0 w-4/6 h-screen bg-slate-900 text-white z-30 shadow-2xl transform transition-all duration-200",
                {
                    "translate-x-full": !isSideMenuOpen
                }
            )
        }>
            <IoCloseOutline 
                size={50}
                className="absolute top-5 right-5 cursor-pointer"
                onClick={ closeMenu }
            />

            <div className='flex flex-col mt-12'>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/como-jugar"  onClick={ closeMenu }>
                    <IoFlashOutline className="w-6 h-6 mr-3"/>
                    Como Jugar
                </Link>
                
                {/* <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/torneos"  onClick={ closeMenu }>
                    <IoTrophyOutline className="w-6 h-6 mr-3"/>
                    Torneos
                </Link> */}
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/cartas"  onClick={ closeMenu }>
                    <IoBookOutline className="w-6 h-6 mr-3"/>
                    Cartas
                </Link>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/laboratorio"  onClick={ closeMenu }>
                    <IoFlaskOutline className="w-6 h-6 mr-3"/>
                    Laboratorio
                </Link>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/mazos"  onClick={ closeMenu }>
                    <IoLayers className="w-6 h-6 mr-3"/>
                    Mazos
                </Link>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/productos"  onClick={ closeMenu }>
                    <IoBagRemoveOutline className="w-6 h-6 mr-3"/>
                    Productos
                </Link>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/tiendas"  onClick={ closeMenu }>
                    <IoStorefrontOutline  className="w-6 h-6 mr-3"/>
                    Tiendas
                </Link>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/boveda"  onClick={ closeMenu }>
                    <IoDiamondOutline className="w-6 h-6 mr-3"/>
                    Boveda
                </Link>
                
                <div className="flex flex-row mt-6 border-t-2 pt-4">
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
                { session &&
                <div className="mt-6 border-t-2 pt-4">

                    <Link
                        href="/perfil"
                        className="block w-full h-full mb-2 mt-2 p-1 hover:bg-gray-800 transition-transform"
                    >
                        Tu perfil
                    </Link>
                          
      
                 
                    <button onClick={handleClick} className="block w-full h-full text-left mb-2 mt-2 p-1 hover:bg-gray-800 transition-transform">
                       Cerrar sesión
                    </button>
                  
                </div>
                }
            </div>                
        </nav>
    </div>
  )
}
