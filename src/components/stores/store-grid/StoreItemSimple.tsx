'use client';

import { Store } from '@prisma/client';
import Link from 'next/link';
import { IoStorefrontOutline } from 'react-icons/io5';


interface Props {
    store: Store;
}

export const StoreItemSimple = ({ store }: Props) => {

  return (
    <div className='rounded-md overflow-hidden fade-in mb-4 bg-white pb-2 shadow-md'>

        <div className='ml-4 my-2'>
            <Link href={"/tiendas"} target='blank'>
            <span className='flex flex-row font-bold text-indigo-600'>{store.city}, {store.country}</span>
            <h3 className='text-xl font-bold'>{store.name}</h3>
            <p className='flex flex-row font-semibold mt-1'>
              <IoStorefrontOutline  className='w-6 h-6 mr-2'/>
              {store.address}</p>
            </Link>
        </div>

    </div>
  )
}
