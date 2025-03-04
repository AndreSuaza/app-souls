

import { Tournament } from '@/interfaces';
import moment from 'moment';
import { IoCalendarOutline } from 'react-icons/io5';


interface Props {
  tournament: Tournament;
  imageShow?: Boolean;

}

export const TournamentItemShort = ({ tournament }: Props) => {
  console.log(tournament);
  return (
    <div className='bg-white shadow-md grid grid-cols-5 my-4 px-2 rounded-lg py-4'>
      <div className=''>
        <div className='text-center'>
          <p className='text-xl md:text-lg mb-2 font-bold'>{moment(tournament.date).format('dddd')}</p>
          <IoCalendarOutline className='w-16 h-16 mx-auto mb-3'/>
          <p className='font-semibold '>{moment(tournament.date).format('h:mm a')}</p>
        </div>
      </div>
      <div className='col-span-4 mx-4'>
        <span className='font-semibold text-indigo-400'>{`${tournament.store.name}, ${tournament.store.city}`}</span>
        <h2 className='text-2xl font-bold'>{tournament.title}</h2>
        <p>{tournament.descripcion}</p>
        <button className='btn-primary mt-4'>Ver tienda</button>
      </div>
    </div>
  )
}
