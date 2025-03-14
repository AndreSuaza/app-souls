

import { Tournament } from '@/interfaces';
import moment from 'moment';
import Link from 'next/link';

interface Props {
  tournament: Tournament;
}

export const TournamentItemShort = ({ tournament }: Props) => {

  return (
    <Link href="/tiendas">
    <div className='bg-white shadow-md grid grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 my-4 rounded-lg p-4'>
      
      <div className='ml-2'>
        <div className='font-bold'>
          <p className='uppercase overflow-hidden text-sm'>{moment(tournament.date).format('dddd')}</p>
          <p className=''>{moment(tournament.date).format('h:mm a')}</p>
        </div>
      </div>
      <div className='col-span-2 mx-2'>
        <p className='font-bold text-sm'>{tournament.store.city}</p>
        <p className='font-semibold text-indigo-600'>{`${tournament.store.name}`}</p>
        <h3 className='text-lg'>{tournament.title}</h3>        
      </div>
     
    </div>
    </Link>
  )
}
