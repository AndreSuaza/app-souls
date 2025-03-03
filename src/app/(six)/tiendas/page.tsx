import { getStorePagination } from "@/actions";
import { Title } from "@/components";
import { StoreGrid } from "@/components/stores/store-grid/StoreGrid";



export default async function TiendasPage() {

  const stores = await getStorePagination();

  return (
    <div className="lg:mx-40">
    <Title 
      title="Tiendas"
    />
    <StoreGrid stores={stores}/>
    </div>
  )
}
