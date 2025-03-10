import { Decklist } from "@/interfaces/decklist.interface"
import Image from "next/image";

interface Props {
    decklist: Decklist[];
    className?:string;
    title?: string;
}

export const DeckImage = ({decklist, className, title}: Props) => {
  return (
    <div className={className}>
        <h2 className="uppercase font-bold text-sm py-2">{title}</h2>
        <ul className="grid grid-cols-8 gap-1">
        
        { decklist.map(c => 
            <li key={c.card.id} className="relative mx-auto mb-6">
                <div className="w-24 h-[8.5rem]">
                <Image
                    src={`/cards/${c.card.code}-${c.card.idd}.webp`}
                    alt={c.card.name}
                    className='w-full object-cover rounded md:rounded-md'
                    fill
                />
                { c.count === 2 && 
                
                    <Image
                        src={`/cards/${c.card.code}-${c.card.idd}.webp`}
                        alt={c.card.name}
                        className='absolute object-cover rounded-md mt-4 top-0'
                        fill
                    />
                
                }
                </div>
            </li>
        )}
    
        </ul>
    </div>
    
  )
}
