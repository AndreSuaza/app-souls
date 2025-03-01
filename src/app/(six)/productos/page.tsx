import { getProductsPagination } from "@/actions";
import { ProductGrid, Title } from "@/components";


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
