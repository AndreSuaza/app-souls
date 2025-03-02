import { getStorePagination } from "@/actions";
import { Title } from "@/components";



export default async function TiendasPage() {

  const stores = await getStorePagination();

  return (
    <div className="lg:mx-40">
    <Title 
      title="Tiendas"
    />
    
    </div>
  )
}
