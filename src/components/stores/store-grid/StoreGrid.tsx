import { Store } from "@/interfaces";
import { StoreItem } from "./StoreItem"

interface Props {
    stores: Store[];
}


export const StoreGrid = ({stores}: Props) => {


  return (
    <div className="grid grid-col-1 lg:grid-cols-4 mx-4">
      {/* <div className="">
        {
          stores.map( (store, index) => (
            <StoreItem 
              key={ store.id }
              store={store}
              setUrl={() => setUrlMap(index)}
            />
          ))
        }
      </div> */}
      <div className="col-span-3 mx-4">
          <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.7372294670768!2d-74.07432539999999!3d4.640895400000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f9bcd484e7dad%3A0x4e531719a7d42f71!2sHidden%20TCG%20Store!5e0!3m2!1ses-419!2sco!4v1734452405042!5m2!1ses-419!2sco`}
              style={{ border: 0 }}
              className="w-full h-screen border-0 rounded-lg"
              aria-hidden="false"
          />
      </div>
    </div>
  )
}
