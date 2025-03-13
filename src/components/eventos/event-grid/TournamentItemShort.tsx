

import { Tournament } from '@/interfaces';
import moment from 'moment';
import Link from 'next/link';
import { IoCalendarOutline } from 'react-icons/io5';


interface Props {
  tournament: Tournament;
}

export const TournamentItemShort = ({ tournament }: Props) => {

  return (
    <div className='bg-white shadow-md grid grid-cols-5 my-4 rounded-lg py-4'>
      <div className='col-span-2'>
        <div className='text-center'>
          <p className='mb-2 font-bold'>{moment(tournament.date).format('dddd')}</p>
          <IoCalendarOutline className='w-10 h-10 mx-auto mb-3'/>
          <p className='font-semibold '>{moment(tournament.date).format('h:mm a')}</p>
        </div>
      </div>
      <div className='col-span-3 mx-2'>
        <span className='font-semibold text-indigo-400'>{`${tournament.store.name}, ${tournament.store.city}`}</span>
        <h2 className='text-2xl font-bold'>{tournament.title}</h2>
        <p>{tournament.descripcion}</p>
        <Link href="/tiendas">
          <button className='btn-primary mt-4'>Ver tienda</button>
        </Link>
      </div>
    </div>
  )
}
