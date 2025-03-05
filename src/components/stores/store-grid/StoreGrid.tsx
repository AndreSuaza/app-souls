'use client';

import { Store } from "@/interfaces";
import { StoreItem } from "./StoreItem"
import { useState } from "react";
import { MapXl } from "@/components/map/MapXl";

interface Props {
    stores: Store[];
}


export const StoreGrid = ({stores}: Props) => {

  const [index, setIndex] =  useState(0);


  const setPositionMap = (index: number) => {
    setIndex(index)
  }

  return (
    <>
      
      <div className="absolute left-0 mr-6 mt-6 overflow-auto z-10 flex flex-row w-full">
        {
          stores.map( (store, index) => (
            <StoreItem 
              key={ store.id }
              store={store}
              setPostion={setPositionMap}
              index={index}
            />
          ))
        }
      </div>
      <MapXl title={stores[index].name} lat={stores[index].lat} lgn={stores[index].lgn}/>
    </>
   
  )
}
