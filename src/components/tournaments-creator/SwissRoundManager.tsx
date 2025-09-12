// SwissRoundManager.tsx
import { useState } from "react";
import { generateSwissRound, Player, Round } from './swiss';
import clsx from "clsx";
import { IoChevronDownSharp, IoChevronUp, IoTrophySharp } from "react-icons/io5";
import { saveToLocalStorage } from "@/lib/localStorage";

type Props = {
  players: Player[];
  setPlayers: (players: Player[]) => void;
  rounds: Round[];
  setRounds: (rounds: Round[]) => void;
  currentRound: Round | undefined;
  setCurrentRound: (rounds: Round) => void;
};

export default function SwissRoundManager({ players, setPlayers, rounds, setRounds, currentRound, setCurrentRound }: Props) {

  const [showHistory, setShowHistory] = useState(true);
  const [end, setEnd] = useState(false);
  const maxRounds = Math.ceil(Math.log2(players.length));

  console.log("currentRound", currentRound);

  const showHistoryButton = () => {
    setShowHistory(!showHistory);
  }

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
    <div className="p-4 border rounded-md bg-slate-50 border-gray-300 col-span-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl text-center font-bold uppercase mb-2">Rondas del torneo</h2>
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
      <div >

        <div className="py-2 px-4 border rounded-md bg-slate-50 border-gray-300">
          <h3 className="text-lg font-semibold uppercase text-gray-700 mb-2">Ronda {currentRound?.number}</h3>
          <ul className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {currentRound?.matches?.map((match, idx) => (
              <li key={match.player1.name} className="grid grid-cols-5 gap-2 text-center p-1 border rounded">
                
                <button 
                  onClick={ () => setResultRount(idx,"P1") }
                  className={clsx(
                    "text-center capitalize col-span-2  hover:bg-blue-500 transition-all relative",
                     match.result === "P1" ? "bg-blue-500 text-white" : "bg-blue-100 text-black" // condicionales
                  )}
                > 
                  { match.result === "P1" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full">
                    <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
                  </span>}
                  {match.player1.name}
                </button>
                <div className="text-xl uppercase font-extrabold mx-2 text-gray-500">vs</div>
                <button 
                  onClick={ () => setResultRount(idx,"P2") }
                  className={clsx(
                    "text-center capitalize col-span-2  hover:bg-red-500 transition-all relative",
                     match.result === "P2" ? "bg-red-500 text-white" : "bg-red-100 text-black" // condicionales
                  )}
                > 
                  { match.result === "P2" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full">
                    <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
                  </span>}
                  {match.player2.name}
                </button>
              </li>
            ))}
          </ul>
          
        </div>
      
        <div className={
          clsx(
              "py-2 px-4 border rounded-md bg-slate-50 border-gray-300 mt-4 transition-all overflow-hidden",
              showHistory ? "" : "h-[50px]" 
        )}>
          <div className="flex justify-between items-center">
            <h2 className="text-center uppercase text-xl font-bold text-gray-500">Historial</h2>
            {showHistory
            ? <IoChevronUp className="p-1 w-8 h-8 rounded-md border" onClick={showHistoryButton} /> 
            : <IoChevronDownSharp className="p-1 w-8 h-8 rounded-md border" onClick={showHistoryButton}/>}
          </div>
            
              {rounds.slice().reverse().map((round) => (
                <div key={round.number}>
                <h3 className="font-semibold uppercase text-gray-900 my-2">Ronda {round.number}</h3>
                <ul className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {round.matches.map((match) => (
                 <li key={match.player1.name} className="grid grid-cols-5 gap-2 text-center p-1 border rounded">
                    <div 
                      className={clsx(
                        "text-center capitalize col-span-2 relative",
                        match.result === "P1" ? "bg-blue-100" : "bg-gray-200 text-black" // condicionales
                      )}
                    > 
                      { match.result === "P1" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full opacity-70">
                        <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
                      </span>}
                      {match.player1.name}
                    </div>
                    <div className="text-xl uppercase font-extrabold mx-2 text-gray-500">vs</div>
                    <div 
                      className={clsx(
                        "text-center capitalize col-span-2 relative",
                        match.result === "P2" ? "bg-red-100" : "bg-gray-200 text-black" // condicionales
                      )}
                    >
                      { match.result === "P2" && <span className="absolute -left-2 -top-2 bg-gray-600 rounded-full opacity-70 ">
                        <IoTrophySharp className="w-5 h-5 text-yellow-400 p-1"/>
                      </span>}  
                      {match.player2.name}
                    </div>
                  </li>
                ))}
                </ul>
                </div>
              ))}
           
        </div>
      </div>
    </div>
  );
}
