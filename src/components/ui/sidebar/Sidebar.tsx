'use client';

import { useUIStore } from '@/store';
import clsx from 'clsx';
import Link from 'next/link';
import { IoBagHandleOutline, IoBagRemoveOutline, IoCloseOutline, IoDiamondOutline, IoFlashOutline, IoFlaskOutline, IoLogInOutline, IoLogOutOutline, IoPeopleOutline, IoPersonOutline, IoSearchOutline, IoShieldOutline, IoStorefrontOutline, IoTicketOutline, IoTrophyOutline } from 'react-icons/io5';

export const Sidebar = () => {

  const isSideMenuOpen = useUIStore( state => state.isSideMenuOpen);
  const closeMenu = useUIStore( state => state.closeSideMenu );

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

            {/* Input */}
            {/* <div className="relative mt-14">
                <IoSearchOutline
                    size={20}
                    className="absolute top-2 left-2"
                />
                <input 
                    type="text"
                    placeholder="Buscar"
                    className="w-full bg-gray-50 rounded pl-10 py-1 pr-10 border-b-2 text-xl border-gray-200 focus:outline-none focus:border-indigo-500 "    
                />
            </div> */}
            <div className='flex flex-col mt-12'>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/como-jugar"  onClick={ closeMenu }>
                    <IoFlashOutline className="w-6 h-6 mr-3"/>
                    Como Jugar
                </Link>
                
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/torneos"  onClick={ closeMenu }>
                    <IoTrophyOutline className="w-6 h-6 mr-3"/>
                    Torneos
                </Link>
                <Link className="flex m-2 p-2 transition-all uppercase font-bold hover:text-yellow-600 hover:border-b-2 hover:border-yellow-600" href="/laboratorio"  onClick={ closeMenu }>
                    <IoFlaskOutline className="w-6 h-6 mr-3"/>
                    Laboratorio
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
            </div>
           
                
        </nav>
    </div>
  )
}
