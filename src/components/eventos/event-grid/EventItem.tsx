
import { Event } from '@/interfaces';
import Image from 'next/image';


interface Props {
    event: Event;
}

export const EventItem = ({ event }: Props) => {

  return (
    <div className='rounded-xl overflow-hidden fade-in'>
      <Image
          src={`/events/${event.image}.webp`}
          alt={event.title}
          className='w-full object-cover'
          width={500}
          height={500}
      />
    </div>
  )
}
