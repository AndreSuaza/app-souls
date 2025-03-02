'use client';

import Image from 'next/image';
import { Product } from '../../../interfaces/products.interface';
import Link from 'next/link';
import { useState } from 'react';

interface Props {
    product: Product;
}

export const ProductItem = ({ product }: Props) => {

  const [displayImage, setDisplayImage] = useState(`${product.ProductImage[0].url}.webp`);

  return (
    <div className='rounded-md overflow-hidden fade-in'>
      <Link href={`/productos/${ product.url }`}>
          <Image
              src={`/products/${displayImage}`}
              alt={product.name}
              className='w-full object-cover'
              width={500}
              height={500}
              // onMouseEnter={ () => setDisplayImage(`${product.images[0].name}.webp`) }
              // onMouseLeave={ () => setDisplayImage(`${product.images[1].name}.webp`) }
          />
      </Link>
      <div className='p-4 flex flex-col text-center'>
        <p className='font-bold text-indigo-900'>{`${product.releaseDate}`}</p>
        <Link 
        className='hover:text-violet-500 font-semibold text-2xl'
        href={`/product/${ displayImage }`}>
          { product.name }
        </Link>
        
      </div>
    </div>
  )
}
