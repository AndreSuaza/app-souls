'use client';
// SwissRoundManager.tsx
import { useState } from "react";
import { generateSwissRound, Player, Round } from './swiss';
import { saveToLocalStorage } from "@/lib/localStorage";
import { PairingButtons } from "@/components";

type Props = {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  rounds: Round[];
  setRounds: (rounds: Round[]) => void;
  currentRound: Round | undefined;
  setCurrentRound: (rounds: Round) => void;
};

export const SwissRoundManager = ({ players, setPlayers, rounds, setRounds, currentRound, setCurrentRound }: Props) => {

  const [end, setEnd] = useState(false);
  const maxRounds = Math.ceil(Math.log2(players.length));

  const showNewRound = () => {
 
    if(rounds.length === 0 && players.length > 3) return true;

    if (rounds.length >= maxRounds) {
      return false;
    }
    
    return true;
  }

  const showEndTournament = () => {
    if(maxRounds === rounds.length && !end) return true;
    return false;
  }

  const endTournament = () => {
    setEnd(true);
    scoreRound()
  } 

  const handleGenerateRound = () => {
    
    setEnd(false);
    const newRound = generateSwissRound(scoreRound(), rounds);

    if (!newRound) {
      confirm("No se pudo generar una nueva ronda sin repetir emparejamientos.");
      return;
    }
    
    
    setCurrentRound(newRound);
    saveToLocalStorage("currentRound", newRound);
    setRounds([...rounds, newRound]);
    saveToLocalStorage("rounds", [...rounds, newRound]);
  };


  const setResultRount = (matchIndex: number, result: "P1" | "P2" | "Draw"  ) => {
    
    if (!currentRound || end) return;

    let resultTemp = result;
    
    const updatedMatches = [...currentRound.matches];

    if(updatedMatches[matchIndex].result === result) {
      resultTemp = "Draw";
    } 

    updatedMatches[matchIndex].result = resultTemp;
    
    setCurrentRound({ ...currentRound, matches: updatedMatches });
    saveToLocalStorage("currentRound", { ...currentRound, matches: updatedMatches });
  }
  
  const scoreRound = () => {

    if (!currentRound) return players;
    const updatedPlayers = players.map(p => ({ ...p }));
   
    currentRound.matches?.map((match) => {
  
    const p1 = updatedPlayers.find(p => p.name === match.player1.name);
    const p2 = updatedPlayers.find(p => p.name === match.player2.name);
      
    if (p1 && match.player2.name !== "BYE") p1.rivals.push(match.player2.name);
    if (p2 && match.player1.name !== "BYE") p2.rivals.push(match.player1.name);

    if (p1 && match.player2.name == "BYE") match.result = "P1";

    if (match?.result === "P1") {
      if (p1) p1.points += 3;
    } else if (match?.result === "P2") {
      if (p2) p2.points += 3;
    }        
    
    if(!match.result || match.result === "Draw") {
      if (p1) p1.points += 1;
      if (p2) p2.points += 1;
    }

    })

    setPlayers(updatedPlayers);
    saveToLocalStorage("usuarios", updatedPlayers);
    return updatedPlayers;

  }

  return (
    <div className="p-4 border rounded-md bg-slate-50 border-gray-300">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-center font-bold uppercase mb-2">Rondas del torneo {maxRounds}</h2>
        {showNewRound()
        &&
          <button
            onClick={handleGenerateRound}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Generar Ronda
          </button>      
        }
        { showEndTournament()
          &&
          <button
            onClick={endTournament}
            className="bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Finalizar Torneo
          </button>
        }
        
        
      </div>
      <div className="py-2 px-4 border rounded-md bg-slate-50 border-gray-300">
        <h3 className="text-lg font-semibold uppercase text-gray-700 mb-2">Ronda {currentRound?.number}</h3>
        <ul>
          {currentRound?.matches?.map((match, idx) => (
            <li key={match.player1.name} className="grid grid-cols-6 gap-2 text-center p-1 border rounded mb-2">
                <PairingButtons index={idx} setResultRount={setResultRount} pair={match}/>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
