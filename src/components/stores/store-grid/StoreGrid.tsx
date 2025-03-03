'use client';

import { Store } from "@/interfaces";
import { StoreItem } from "./StoreItem"
import { Map } from "@/components/map/Map";
import { useState } from "react";

interface Props {
    stores: Store[];
}


export const StoreGrid = ({stores}: Props) => {

  const [index, setIndex] =  useState(0);


  const setPositionMap = (index: number) => {
    setIndex(index)
  }

  return (
    <div className="grid grid-col-1 lg:grid-cols-4 mx-4">
      <div className="">
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
      <div className="col-span-3 mx-4">
        <Map title={stores[index].name} lat={stores[index].lat} lgn={stores[index].lgn} className={"w-full h-screen border-0 rounded-lg"}/>
      </div>
    </div>
  )
}
