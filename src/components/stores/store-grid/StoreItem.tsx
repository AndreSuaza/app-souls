'use client';

import { Store } from '@prisma/client';
import Image from 'next/image';


interface Props {
    store: Store;
    index: number;
    setPostion: (index: number) => void
}

export const StoreItem = ({ store, index, setPostion }: Props) => {

  return (
    <div className='rounded-md fade-in mb-4 bg-white pb-2 shadow-md ml-4'>

        <div className='col-span-2 my-2 w-[300px] pl-4'>
            <div className='h-[100px]'>
              <h3 className='font-bold text-indigo-500 uppercase'>{ store.name }</h3>   
              <p className='font-bold'>{store.city}, {store.country}</p>
              <p className='text-lg font-semibold'>Dirección: {store.address}</p>
              {/* <p className='flex flex-row text-lg font-semibold'>Teléfono: {store.phone}</p> */}
            </div>
            {/* <button className='btn-primary mt-3 mr-2'>Ver Eventos</button> */}
            <button className='btn-primary mt-3' onClick={() => setPostion(index)}>Mapa</button>
        </div>
        

    </div>
  )
}
