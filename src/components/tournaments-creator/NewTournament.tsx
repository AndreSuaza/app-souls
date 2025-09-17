'use client';

import { saveToLocalStorage } from "@/lib/localStorage";
import { useRouter } from "next/navigation";
import { IoTrophySharp } from "react-icons/io5";

export const NewTournament = () => {
    
    const router = useRouter();

    const newTournament = () => {
        saveToLocalStorage("usuarios", []);
        saveToLocalStorage("currentRound", []);
        saveToLocalStorage("rounds", []);
        router.push("/admin/creador-de-torneos/torneo");
    }  

    return (
        <button 
        onClick={newTournament}
        className="bg-indigo-600 text-gray-200 text-3xl text-center uppercase py-3 px-4 w-[210px] hover:bg-indigo-700 flex">
            <IoTrophySharp className="w-6 h-6 mt-1 mr-3"/>
            Nuevo Torneo
        </button>
    );

}