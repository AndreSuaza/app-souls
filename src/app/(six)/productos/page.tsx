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

    <ProductGrid 
      products={products}
    />
    </>
  )
}
