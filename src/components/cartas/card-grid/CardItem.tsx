
import Image from 'next/image';
import { Card } from '@/interfaces/cards.interface';
import { useCardDetailStore } from '@/store';

interface Props {
    card: Card;
}

export const CardItem = ({ card }: Props) => {

  const openCardDetail = useCardDetailStore( state => state.openCardDetail);
  return (
    <div 
      className='rounded-xl overflow-hidden fade-in'
      onClick={() => openCardDetail(card)}
    >
      <Image
          src={`/cards/${card.code}-${card.idd}.webp`}
          alt={card.name}
          className='w-full object-cover'
          width={500}
          height={718}
      />
    </div>
  )
}
