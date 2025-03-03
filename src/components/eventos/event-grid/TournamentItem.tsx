

import { Tournament } from '@/interfaces';
import Image from 'next/image';


interface Props {
  tournament: Tournament;
}

export const TournamentItem = ({ tournament }: Props) => {
  console.log(tournament);
  return (
    <div className='flex flex-grow gap-1 rounded-lg'>
      <div className=''>
        <Image
            src={`/tournaments/${tournament.TournamentImage[0].url}.jpg`}
            alt={tournament.title}
            className='rounded-sm'
            width={120}
            height={120}
        />
      </div>
      <div className='col-span-2'>
        <h2 className='text-2xl font-bold'>{tournament.title}</h2>
        <p>{tournament.descripcion}</p>
        <button className='btn-primary mt-4'>Conoce Mas...</button>
      </div>
      <div className='col-span-2'>
        <p>{tournament.date.toString()}</p>
      </div>
    </div>
  )
}
