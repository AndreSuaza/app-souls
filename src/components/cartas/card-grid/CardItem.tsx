
import Image from 'next/image';
import { Card } from '@/interfaces/cards.interface';

interface Props {
    card: Card;
    addCard?: (c: Card) => void
}

export const CardItem = ({ card, addCard }: Props) => {

  return (
    <div key={ card.id } className="flex flex-col transition-all hover:-mt-2 cursor-pointer drop-shadow-lg">
      <div 
        className='rounded-xl overflow-hidden fade-in'
        onClick={() => addCard && addCard(card)}
    >
        <Image
            src={`/cards/${card.code}-${card.idd}.webp`}
            alt={card.name}
            className='w-full object-cover'
            width={500}
            height={718}
        />
      </div>
    </div>
  )
}
