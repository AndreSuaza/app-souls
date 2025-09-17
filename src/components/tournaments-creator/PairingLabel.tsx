'use client';

import clsx from "clsx";
import { IoTrophySharp } from "react-icons/io5";
import { Pair } from "./swiss";

type Props = {
  pair: Pair;
};


export const PairingLabel = ({pair}: Props) => {

  return (
    <>
    <div 
        className={clsx(
        "text-center capitalize col-span-2 relative",
        {
            "bg-blue-100 text-white": pair.result === "P1",
            "bg-yellow-100": pair.result === "Draw",
        }
        )}
    > 
        { pair.result === "P1" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full opacity-70">
        <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
        </span>}
        {pair.player1.name}
    </div>
    <div className="text-xl uppercase font-extrabold mx-2 text-gray-500">vs</div>
    <div 
        className={clsx(
       "text-center capitalize col-span-2 relative",
        {
            "bg-red-100 text-white": pair.result === "P2",
            "bg-yellow-100": pair.result === "Draw",
        }
        )}
    >
        { pair.result === "P2" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full opacity-70 ">
        <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
        </span>}  
        {pair.player2.name}
    </div>
    </>
  )
}
