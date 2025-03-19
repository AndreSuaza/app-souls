// export const revalidate = 604800; //7 dias


import { getCardsByProductId, getProductUrl } from '@/actions';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from 'next/image';
import { CompleteCollection } from '@/components/productos/complete-collection/CompleteCollection';
import '../style.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mazo de Demostracíon 2.0 - TCG',
  description: 'El Mazo de Demostración **Alma Renacida** de Souls In Xtinction TCG es la puerta de entrada perfecta para nuevos jugadores y una herramienta esencial para quienes buscan perfeccionar su estrategia.',
  openGraph: {
      title: 'Mazo de Demostracíon 2.0 - TCG',
      description: 'El Mazo de Demostración **Alma Renacida** de Souls In Xtinction TCG es la puerta de entrada perfecta para nuevos jugadores y una herramienta esencial para quienes buscan perfeccionar su estrategia.',
      url: 'https://soulsinxtinction.com/productos/mazo-demostracion-2',
      siteName: 'Mazo de Demostracíon 2.0',
      images: [
          {
          url: 'https://soulsinxtinction.com/products/MD2.webp',
          width: 500,
          height: 500,
          alt: 'El Mazo de Demostración Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default async function getProductBySlug() {

  const product = await getProductUrl('mazo-demostracion-2')
  
  if (!product) { notFound();}

  const cards =  await getCardsByProductId(product ? product.id : '');
  
  return (

    <>
    <section className={`bg-[url(/products/MD2BG.webp)] bg-cover bg-fixed w-full bg-left-top grid grid-cols-1 lg:grid-cols-2`}>
      <div className='flex flex-col items-center justify-center w-full p-12'>
          <Image
                  src={`/products/${product.code}S.webp`}
                  alt={'logo mazo demostracíon 2.0'}
                  className='my-auto'
                  width={400}
                  height={160}
              />
      </div>
      <div className='bg-black bg-opacity-80 text-stone-300 flex justify-end py-10'>
          <div className='w-2/3 m-auto markdawon'>
          <h1 className='text-5xl font-bold text-center mb-10 md:my-10 lg:mx-40'>{product.name}</h1>

          <MDXRemote source={product.description} />
          </div>
        </div>
      
    </section>
    <div className='bg-gray-600 flex flex-col items-center'>
      
      
     
    </div>
    <div className='px-2 lg:px-20 pt-6 bg-slate-950 pb-10'>
      <h2 className='text-4xl font-bold uppercase text-white mb-10'>La colección completa</h2>
      <CompleteCollection cards={cards}/>
    </div>
    
    </>
  )
}
