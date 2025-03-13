'use client';

import { JSX } from "react";
import { IoCloseOutline } from "react-icons/io5";

interface Props { 
    children: JSX.Element;
    className: string;
    close: () => void;
}

export const Modal = ({ children, className, close }: Props) => {

  return (
    <>

    <div
        className="fixed top-0 left-0 w-screen h-screen z-10 bg-black opacity-30"
    />



    <div 
        onClick={ close }
        className="fade-in fixed top-0 left-0 w-screen h-screen z-10 backdrop-filter backdrop-blur-sm"
    />

    <div className={`fixed ${className}`}>
             <IoCloseOutline 
                size={50}
                className="absolute top-3 right-5 cursor-pointer text-gray-100 bg-slate-950 hover:bg-indigo-600"
                onClick={ close }
            />
        {children}
    </div> 
    </>
  )
}
