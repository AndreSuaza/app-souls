'use client';

import { useEffect, useState } from "react";
import { Player, Round } from "./swiss";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/localStorage";
import { IoTrophySharp } from "react-icons/io5";
import { PlayerList, SwissRoundManager, SwissHistoric, ConfirmationModal } from "@/components";
import { useAlertConfirmationStore } from "@/store";


export const Tournament = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Round>();
  
  const isAlertConfirmation = useAlertConfirmationStore( state => state.isAlertConfirmation );

  const calculateBuchholz = (player: Player): number => {
    return player.rivals?.reduce((sum: number, oppName: string) => {
      const opponent = players.find(p => p.name === oppName);
      return sum + (opponent?.points || 0);
    }, 0);
  };

  const standings = [...players]
    .map(p => ({ ...p, buchholz: calculateBuchholz(p) }))
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.buchholz - a.buchholz;
    });

  const newTournament = () => {
    saveToLocalStorage("usuarios", []);
    setPlayers([]);
    saveToLocalStorage("currentRound", undefined);
    setCurrentRound(undefined);
    saveToLocalStorage("rounds", []);
    setRounds([]);
  }  

  useEffect(() => {
    const playersLocalStorage = loadFromLocalStorage("usuarios");
    
    if(playersLocalStorage) {
      setPlayers(playersLocalStorage as Player[])
    }
    
    const roundsLocalStorage = loadFromLocalStorage("rounds");
    
    if(roundsLocalStorage) {
      setRounds(roundsLocalStorage as Round[])
    }

    const currentRoundLocalStorage = loadFromLocalStorage("currentRound");
    console.log("currentRoundLocalStorage", currentRoundLocalStorage);
    if(currentRoundLocalStorage) {  
      setCurrentRound(currentRoundLocalStorage as Round)
    }

  }, []);  

  return (
    <div className="mb-4">
    <div className="px-6 my-2">
    <button 
      onClick={newTournament}
      className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700 flex">
        <IoTrophySharp   className="w-6 h-6 -mt-0.5 mr-3 font-semibold"/>
        Nuevo Torneo
    </button>
    </div>
    <div className="mx-auto px-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2 ">
      <div>
      <PlayerList players={players} setPlayers={setPlayers}/>
      </div>
      <SwissRoundManager
        players={players}
        setPlayers={setPlayers}
        rounds={rounds}
        setRounds={setRounds}
        currentRound={currentRound}
        setCurrentRound={setCurrentRound}
      />
      <SwissHistoric rounds={rounds}/>
      {players.length > 0 && (
        <div className="p-4 border rounded-md bg-slate-50 border-gray-300 min-h-[600px]">
          <h2 className="text-xl text-center font-bold uppercase mb-2">Tabla de Posiciones</h2>
          <table className="w-full table-auto border">
            <thead>
              <tr>
                <th className="border px-2 py-1">#</th>
                <th className="border px-2 py-1">Jugador</th>
                <th className="border px-2 py-1">Puntos</th>
                <th className="border px-2 py-1">DE</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((player, i) => (
                <tr key={player.name} className="text-center">
                  <td className="border px-2 py-1">{i + 1}</td>
                  <td className="border px-2 py-1">{player.name}</td>
                  <td className="border px-2 py-1">{player.points}</td>
                  <td className="border px-2 py-1">{player.buchholz}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
    {isAlertConfirmation && <ConfirmationModal
      text="¿Está seguro de eliminar a este jugador del torneo?"
      className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all w-full md:w-1/3 md:left-1/3 md:h-1/5 md:top-1/3 rounded-md border-2 border-gray-400"
    />}
    </div>
  );
}
