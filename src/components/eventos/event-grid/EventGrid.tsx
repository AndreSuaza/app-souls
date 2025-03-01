
import { Event } from '@/interfaces';
import { EventItem } from './EventItem';


interface Props {
  events: Event[];
}

export const EventGrid = ({events}: Props) => {
  return (
    <div className='grid grid-cols-2 sm:grid-cols-4 gap-10 mb-10 px-2'>
        {
            events.map( event => (
               <EventItem 
                key={ event._id }
                event={event}
               />
            ))
        }

    </div>
  )
}
