'use client';

import { Store } from '@prisma/client';
import Image from 'next/image';
import { IoLogoInstagram } from 'react-icons/io5';


interface Props {
    store: Store;
    setUrl: (url: string) => void
}

export const StoreItem = ({ store, setUrl }: Props) => {

  return (
    <div className='rounded-md overflow-hidden fade-in mb-4 bg-white pb-2 shadow-md'>
      <div className='p-4 flex flex-col text-center bg-indigo-500'>
        <h3 className='font-bold text-gray-200 uppercase'>{ store.name }</h3>      
      </div>
      <div className='grid grid-cols-3'>
        <div className='col-span-2 ml-4 my-2'>
            <p className='flex flex-row font-bold'>{store.city}, {store.country}</p>
            <p className='flex flex-row text-lg font-semibold'>Dirección: {store.address}</p>
            <p className='flex flex-row text-lg font-semibold'>Teléfono: {store.phone}</p>
            <button className='btn-primary mt-3 mr-2'>Ver Eventos</button>
            <button className='btn-primary mt-3' onClick={() => setUrl(store.url)}>Mapa</button>
        </div>
        <div className='flex flex-col justify-center items-center'>
            <Image
                src={`/products/log-eda.png`}
                alt={`Logo ${store.name}`}
                className='mr-8'
                width={150}
                height={150}
            />
        </div>
      </div>
    </div>
  )
}
