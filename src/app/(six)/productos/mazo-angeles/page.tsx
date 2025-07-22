// export const revalidate = 604800; //7 dias


import { getCardsByProductId, getProductUrl } from '@/actions';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from 'next/image';
import { CompleteCollection } from '@/components/productos/complete-collection/CompleteCollection';
import '../style.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mazo Angeles - Amanecer Celestial TCG',
  description: 'El Mazo Amanecer Celestial está diseñado para los jugadores de Souls In Xtinction TCG que buscan el máximo poder del arquetipo Ángeles. Estas cartas poseen algunas de las habilidades y conjuros más poderosos del juego, permitiéndote tomar el control del campo de batalla con estrategias implacables.',
  openGraph: {
      title: 'Mazo Angeles - Amanecer Celestial TCG',
      description: 'El Mazo Amanecer Celestial está diseñado para los jugadores de Souls In Xtinction TCG que buscan el máximo poder del arquetipo Ángeles. Estas cartas poseen algunas de las habilidades y conjuros más poderosos del juego, permitiéndote tomar el control del campo de batalla con estrategias implacables.',
      url: 'https://soulsinxtinction.com/productos/mazo-angeles',
      siteName: 'Mazo Angeles Souls In Xtinction',
      images: [
          {
          url: 'https://soulsinxtinction.com/products/ME2.webp',
          width: 500,
          height: 500,
          alt: 'Mazo Angeles Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default async function getProductBySlug() {

  const product = await getProductUrl('mazo-angeles')
  
  if (!product) { notFound();}

  const cards =  await getCardsByProductId(product ? product.id : '');
  
  return (

    <>
    <section className={`bg-[url(/products/ME2BG.webp)] bg-cover bg-fixed w-full bg-left-top grid grid-cols-1 lg:grid-cols-2`}>
      <div className='flex flex-col items-center justify-center w-full p-12'>
          <Image
                  src={`/products/${product.code}S.webp`}
                  alt={'Mazo Angeles Amanecer Celestial'}
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
