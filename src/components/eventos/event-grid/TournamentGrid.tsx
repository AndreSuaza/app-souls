import { Tournament } from "@/interfaces";
import { TournamentItem } from "./TournamentItem";



interface Props {
  tournaments: Tournament[];
}

export const TournamentGrid = ({tournaments}: Props) => {
  return (
    <div className='m-4 rounded-lg'>
        {
            tournaments.map( tournament => (
               <TournamentItem 
                key={ tournament.id }
                tournament={ tournament }
               />
            ))
        }

    </div>
  )
}
