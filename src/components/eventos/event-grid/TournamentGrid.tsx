import { Tournament } from "@/interfaces";
import { TournamentItem } from "./TournamentItem";
import { TournamentItemShort } from "./TournamentItemShort";



interface Props {
  tournaments: Tournament[];
  short?: Boolean;
}

export const TournamentGrid = ({tournaments, short = false}: Props) => {
  return (
    <div className='rounded-lg'>
        {
            tournaments.map( tournament => (
              
               short ? 
                  <TournamentItemShort 
                    key={ tournament.id }
                    tournament={ tournament }
                  />
               : <TournamentItem 
                    key={ tournament.id }
                    tournament={ tournament }
                  />
            ))
        }

    </div>
  )
}
