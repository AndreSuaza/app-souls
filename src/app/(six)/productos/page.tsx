import { getProductsPagination } from "@/actions";
import { ProductGrid, Title } from "@/components";
import Link from "next/link";
import { IoStorefrontOutline } from "react-icons/io5";


export default async function ProductosPage() {

  const products = await getProductsPagination();

  return (
    <>
    <Title 
      title="Productos"
    />

    <div className="bg-indigo-500 text-white text-center uppercase text-lg font-bold py-2 mb-10">
      <Link href="/tiendas" className="flex justify-center">
        <IoStorefrontOutline className='w-6 h-6 md:mr-2 hidden md:block'/>
        <p>Visita nuestras <span className="underline">tiendas oficiales</span> y adquiere nuestros productos.</p>
      </Link> 
    </div>

    <ProductGrid 
      products={products}
    />
    </>
  )
}
