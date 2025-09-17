'use client';

// PlayerList.tsx
import { useState } from "react";
import { Player } from "./swiss";
import { saveToLocalStorage } from "@/lib/localStorage";
import { IoChevronDownSharp, IoChevronUp, IoTrashOutline } from "react-icons/io5";
import clsx from "clsx";
import { useAlertConfirmationStore } from "@/store";


type Props = {
  players: Player[];
  setPlayers: (players: Player[]) => void;
};

export const PlayerList = ({ players, setPlayers }: Props) => {
  const [name, setName] = useState("");
  const [showPlayers, setShowPlayers] = useState(true);

  const openAlertConfirmation = useAlertConfirmationStore( state => state.openAlertConfirmation );
  const setAction = useAlertConfirmationStore( state => state.setAction );

  const showPlasyersButton = () => {
    setShowPlayers(!showPlayers);
  }

  const deletePlayer = (index: number) => {
    openAlertConfirmation();
    setAction(() => setPlayers(players.filter(player => player.name !== players[index].name)));
  }

  const handleAdd = () => {
    if (name.trim() && !players.find(p => p.name === name)) {
      setPlayers([...players, { name, points: 0, rivals: [], hadBye: false }]);
      saveToLocalStorage("usuarios", [...players, { name, points: 0, rivals: [], hadBye: false }]);
      setName("");
    }
  };

  return (
    <div className={
      clsx(
          "px-4 py-3 border rounded-md bg-slate-50 border-gray-300 overflow-hidden transition-all",
          showPlayers ? "min-h-[200px]" : "h-[60px]" 
        )}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-center uppercase text-xl font-bold">Jugadores</h2>
        {showPlayers 
          ? <IoChevronUp className="p-1 w-8 h-8 rounded-md border" onClick={showPlasyersButton} /> 
          : <IoChevronDownSharp className="p-1 w-8 h-8 rounded-md border" onClick={showPlasyersButton}/>} 
      </div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border px-2 w-full py-1 rounded"
          placeholder="Nombre del jugador"
          maxLength={15}
        />
        <button onClick={handleAdd} className="bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600">
          Añadir
        </button>
      </div>
      <ul>
        {players.map((p, idx) => (
          <li key={p.name}
              className="border-b px-2 py-4 font-semibold"
          >
            <div className="flex justify-between items-center">
              <span className="text-gray-400">{idx+1}</span>
              {p.name}
              <IoTrashOutline className="w-6 h-6 text-gray-400 hover:text-indigo-600" onClick={() => deletePlayer(idx)} />
            </div> 
          </li>
        ))}
      </ul>
    </div>
  );
}
