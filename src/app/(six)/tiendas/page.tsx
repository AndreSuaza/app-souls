import { getStorePagination } from "@/actions";
import { Title } from "@/components";
import { StoreGrid } from "@/components/stores/store-grid/StoreGrid";



export default async function TiendasPage() {

  const stores = await getStorePagination();

  return (
    <>
    <Title 
      title="Tiendas"
    />
    
    <StoreGrid stores={stores}/>

    </>
  )
}
