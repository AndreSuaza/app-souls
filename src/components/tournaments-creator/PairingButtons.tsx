import clsx from "clsx";
import { IoTrophySharp } from "react-icons/io5";
import { Pair } from "./swiss";

type Props = {
  pair: Pair;
  index: number;
  setResultRount: (matchIndex: number, result: "P1" | "P2" | "Draw") => void;
};


export const PairingButtons = ({pair, index, setResultRount}: Props) => {

  return (
    <>
    <button 
        onClick={ () => setResultRount(index,"P1") }
        className={clsx(
        "text-center capitalize col-span-2 bg-blue-100 text-black hover:bg-blue-500 transition-all relative",
        {
            "bg-blue-500 text-white": pair.result === "P1",
            "bg-yellow-100": pair.result === "Draw",
        }
        )}
    > 
        { pair.result === "P1" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full">
        <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
        </span>}
        {pair.player1.name}
    </button>
    <div className="text-xl uppercase font-extrabold mx-2 text-gray-500">vs</div>
    <button 
        onClick={ () => setResultRount(index,"P2") }
        className={clsx(
        "text-center capitalize col-span-2 bg-red-100 text-black hover:bg-red-500 transition-all relative",
        {
            "bg-red-500 text-white": pair.result === "P2",
            "bg-yellow-100": pair.result === "Draw",
        }
        )}
    > 
        { pair.result === "P2" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full">
        <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
        </span>}
        {pair.player2.name}
    </button>
    <button 
        onClick={ () => setResultRount(index,"Draw") }
        title="Partida Empatad"
        className={"text-center bg-indigo-500 text-white rounded"}
    > 
        PE
    </button>
    </>
  )
}
