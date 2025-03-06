import { Tournament } from "@/interfaces";
import { TournamentItem } from "./TournamentItem";
import { TournamentItemShort } from "./TournamentItemShort";



interface Props {
  tournaments: Tournament[];
  short?: Boolean;
}

export const TournamentGrid = ({tournaments, short = false}: Props) => {
  return (
    <ul className='rounded-lg'>

        {
            tournaments.map( tournament => (
              
               short ? 
                  <li key={ tournament.id }>
                  <TournamentItemShort 
                    tournament={ tournament }
                  />
                  </li>
               : 
                <li key={ tournament.id }>
                <TournamentItem 
                      key={ tournament.id }
                      tournament={ tournament }
                    />
                </li>
            ))
        }

    </ul>
  )
}
