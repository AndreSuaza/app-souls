// export const revalidate = 604800; //7 dias


import { getCardsByProductId, getProductUrl } from '@/actions';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc'
import Image from 'next/image';
import { CompleteCollection } from '@/components/productos/complete-collection/CompleteCollection';
import '../style.css';
import { Metadata } from 'next';
interface Props {
  params: {
    slug: string;
  }
}

export const metadata: Metadata = {
  title: 'Mazo Demonios - Arte de la Destrucción - TCG',
  description: 'El Mazo Arte de la Destrucción de Souls In Xtinction TCG está basado en el arquetipo de Demonios, criaturas caóticas que buscan acabar los duelos de manera rápida y letal. Estos pequeños diablillos se multiplican con facilidad, invocando más aliados a su juego de destrucción y asegurando la victoria en pocos turnos.',
  openGraph: {
      title: 'Mazo Demonios - Arte de la Destrucción - TCG',
      description: 'El Mazo Arte de la Destrucción de Souls In Xtinction TCG está basado en el arquetipo de Demonios, criaturas caóticas que buscan acabar los duelos de manera rápida y letal. Estos pequeños diablillos se multiplican con facilidad, invocando más aliados a su juego de destrucción y asegurando la victoria en pocos turnos.',
      url: 'https://soulsinxtinction.com/productos/mazo-demonios',
      siteName: 'Mazo Demonios Souls In Xtinction',
      images: [
          {
          url: 'https://soulsinxtinction.com/products/ME1.webp',
          width: 500,
          height: 500,
          alt: 'Mazo Demonios Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default async function getProductBySlug({ params }: Props) {

  const { slug } = await params;
  const product = await getProductUrl('mazo-demonios')
  
  if (!product) { notFound();}

  const cards =  await getCardsByProductId(product ? product.id : '');
  
  return (

    <>
    <section className={`bg-[url(/products/ME1BG.webp)] bg-cover bg-fixed w-full bg-left-top grid grid-cols-1 lg:grid-cols-2`}>
      <div className='flex flex-col items-center justify-center w-full p-12'>
          <Image
                  src={`/products/${product.code}S.webp`}
                  alt={'logo ecos del abismo'}
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
