// export const revalidate = 604800; //7 dias


import { getProductUrl } from '@/actions';
import { ProductMobileSlideshow, Title } from '@/components';
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
 

const mku = `
## Primer Estallido

El **_Mazo de Demostración - Primer estallido_** contiene todos los tipos de cartas, mecánicas y la mayoría de arquetipos de la primera temporada de **_Souls In Xtinction_**, además, viene con cartas extremadamente útiles y versátiles para armar cualquier tipo de estrategia que se te ocurra, no te pierdas la oportunidad de entrar en este maravilloso y competitivo universo de **_Souls In Xtinction_**.
`;

export default async function getProductBySlug({ params }: Props) {

  const { slug } = await params;
  const product = await getProductUrl(slug)
  
  if (!product) {
    notFound();
  }

  return (

    <>
    <section className='grid grid-cols-1 lg:grid-cols-2 lg:mx-40'>
      <div className='flex flex-col items-center justify-center w-full h-[500px] p-12 lg:ml-20 lg:w-[500px] lg:h-[800px]'>
          <Image
                  src={`/products/${product.code}S.webp`}
                  alt={'logo ecos del abismo'}
                  className='m-10'
                  width={400}
                  height={160}
              />
      </div>
      <div className='pb-10 flex flex-col justify-center items-center mx-4 lg:mx-20'>

          <MDXRemote source={mku} />
    

      </div>
    </section>
    <section className='flex flex-col items-center py-8 bg-red-400'>
      <div className='lg:w-1/2 text-center my-10'>
        <h3 className='text-3xl uppercase mb-4'>Resuenan los Ecos del Abismo</h3>
        <p className='text-xl mx-4'>Antiguas fuerzas despiertan desde las profundidades, trayendo consigo poder y caos. Solo los más valientes podrán dominar su energía y convertirla en su arma definitiva.</p> 
      </div>
      <ProductMobileSlideshow 
        title={ "test" }
        images={ ["GNC-001-8225.webp", "GNC-002-2415.webp"] }
      />
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

            <MDXRemote source={mku} />
    

      </div>
    </section>

    </>
  )
}
