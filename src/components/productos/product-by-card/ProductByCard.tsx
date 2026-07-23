
import Image from "next/image";
import Link from 'next/link';
import { toProductImageUrl } from "@/utils/asset-path";

interface Product {
    code: string;
    name: string;
    show: boolean;
    url: string;
}

interface Props { 
    product: Product;
}

export const ProductsByCard = ({product}: Props) => {
  const imageSrc = toProductImageUrl(`products/${product.code}.webp`);
  const fallbackSrc = toProductImageUrl(`products/${product}LOGO.webp`);

  return (
    <div className="grid grid-cols-2 gap-1 ml-2 h-[300px] mb-6">

        { product.show ? 
        
        <Link href={`/productos/${product.url}`} target="_blank">
            <Image 
                width={300} 
                height={300} 
                src={imageSrc} 
                alt={product.name} 
                className="rounded-md m-auto"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                placeholder="blur"
                unoptimized
            />
            <h3>{product.name}</h3>
        </Link>
        :
        <>
        <Image 
            width={300} 
            height={300} 
            src={fallbackSrc} 
            alt={product.name} 
            className="rounded-t m-auto"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
            placeholder="blur"
            unoptimized
        />
        <h3>{product.name}</h3>
        </>
        }
          
      
    </div>
  )
}
