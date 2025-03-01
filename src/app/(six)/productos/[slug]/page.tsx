export const revalidate = 604800; //7 dias


import { getProductUrl } from '@/actions';
import { Title } from '@/components';
import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';

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

  const { slug } = params;
  const product = await getProductUrl(slug)
  
  if (!product) {
    notFound();
  }

  return (
    
    <Title title={product.name}/>
  )
}
