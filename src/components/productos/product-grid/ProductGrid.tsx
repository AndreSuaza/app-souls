import { Product } from '@/interfaces';
import { ProductItem } from './ProductItem';

interface Props {
    products: Product[];
}

export const ProductGrid = ({products}: Props) => {
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-10 mb-10 px-2 lg:mx-40'>
        {
            products.map( product => (
              product.show &&
                <ProductItem 
                  key={ product.id }
                  product={product}
               />
            ))
        }

    </div>
  )
}
