// export const revalidate = 604800; //7 dias


import { getCardsByIds, getPaginatedCards, getProductUrl } from '@/actions';
import { CardGrid, CardGridX, ProductMobileSlideshow, Title } from '@/components';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc'
import "./style.css";
import Image from 'next/image';

interface Props {
  params: {
    slug: string;
  }
}

// export async function generateMetadata(
//   { params }: Props,
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   // read route params
//   const slug = (await params).slug
 
//   // fetch data
//   const product = await getProductUrl(slug);
 
//   // optionally access and extend (rather than replace) parent metadata
//   //const previousImages = (await parent).openGraph?.images || []
 
//   return {
//     title: product?.name,
//     description: product?.descripcion,
//     openGraph: {
//       title: product?.name,
//       description: product?.descripcion,
//       images: [`/products/${product?.ProductImage[0].url}.webp`],
//     },
//   }
// }

export default async function getProductBySlug({ params }: Props) {

  const { slug } = await params;
  const product = await getProductUrl(slug)
  const cardsTop =  await getCardsByIds(["67c5d5290edb5d80d7a66aff", "67c5d52a0edb5d80d7a66b00"])
  
  if (!product) {
    notFound();
  }

  return (

    <>
    <section className='grid grid-cols-1 lg:grid-cols-2 lg:mx-40'>
      <div className='flex flex-col items-center justify-center w-full p-12'>
          <Image
                  src={`/products/${product.code}S.webp`}
                  alt={'logo ecos del abismo'}
                  className='my-auto'
                  width={400}
                  height={160}
              />
      </div>
      <div className='pb-10 flex flex-col justify-center items-center mx-4 md:mt-10 lg:mt-0'>
          <h1 className='text-5xl font-bold text-center mb-10 md:my-10 lg:mx-40'>{product.name}</h1>
          <MDXRemote source={product.description} />
      </div>
    </section>
    <section className='flex flex-col items-center py-8 bg-red-400'>
      <div className='lg:w-1/2 text-center my-10'>
          {/* <MDXRemote source={product.text} /> */}
      </div>
      {/* <ProductMobileSlideshow 
        title={ "test" }
        images={ ["GNC-001-8225.webp", "GNC-002-2415.webp"] }
      /> */}
      <div>
        {/* <CardGridX cards={cardsTop}/> */}

      </div>
    </section>

    <section className='grid grid-cols-1 lg:grid-cols-2'>
      <div className='bg-[url(/products/tajomaru.jpg)] bg-cover bg-center w-full h-[500px] lg:h-[800px]'></div>
      <div className='pb-10 flex flex-col justify-center items-center mx-4 lg:mx-40'>

          <Image
              src={`/products/log-eda.png`}
              alt={'logo ecos del abismo'}
              className='mb-10 mt-6 lg:-mt-20'
              width={400}
              height={160}
          />    

      </div>
    </section>

    </>
  )
}
