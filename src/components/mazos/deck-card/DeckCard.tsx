import { Dateformat } from '@/components/ui/date/dateformat';
import Image from 'next/image'
import Link from 'next/link';
import React from 'react'

interface User {
  nickname: string | null;
}

interface Archetype {
  name: string| null;
}

interface Deck {
  id: string;
  name: string;
  imagen: string;
  cards: string;
  likesCount: number;
  createdAt: Date;
  user: User;
  archetype: Archetype;
}

interface Props {
  mazo: Deck
}

export const DeckCard = ({mazo}:Props) => {

  return (
    <div>
        <Link href={`/laboratorio?id=${mazo.id}`}>
        <Image className="rounded-lg" width={270} height={287} src={`/cards/${mazo.imagen}.webp`} alt={mazo.name} title={mazo.name}/>
        <h2 className="text-xl uppercase font-semibold mt-3">{mazo.name}</h2> 
        </Link> 
        <p className="text-sm">Arquetipo: {mazo.archetype.name}</p>   
        {/* <p className="text-xs">Por: {mazo.user.nickname}</p> */}
        <p className="text-xs text-gray-700"><Dateformat fecha={mazo.createdAt}/></p>
    </div>
  )
}
