'use client';


import { Form, Formik } from "formik";
import { MultiSelect, TextInput } from "../form";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Propertie {
    id: string,
    name: string,
}
  
interface Properties {
    text?: string,
    products: Propertie[],
    rarities: Propertie[],
}


interface Props {
    propertiesCards: Properties;
}

interface SelectProps {
    name: string;
    id: string;
}


export const CardFinderPrices = ({propertiesCards}: Props) => {

    const [properties] =  useState({
        products: propertiesCards.products.map((prop: SelectProps) => {return {label: `${prop.name} [${prop.id}]`, value:prop.id }}),
        rarities: propertiesCards.rarities.map((prop: SelectProps) => {return {label: prop.name, value:prop.id }}),
        });

    const router = useRouter();
    const {products, rarities} = properties;
    
    const getFilterValues = (filter: Propertie[]) => {
        let values = "";
    
        filter.forEach((value, index) => {
          values += index < filter.length -1 ? value+"," : value
        });
    
        return values;
    }

    const searchCards = (filters: Properties) => { 

        let query = "";
        if (filters.text && filters.text !== "") query += '&text='+filters.text;
        if (filters.products.length > 0) query += '&products='+getFilterValues(filters.products);
        if (filters.rarities.length > 0) query += '&rarities='+getFilterValues(filters.rarities);

       return query;
    
    };

    const onSubmit = (filters: Properties) => {

        router.push(`/boveda?${searchCards(filters)}`);

    }

  return (
    <Formik 
        initialValues={{
            text: '',
            products: [],
            rarities: [],
        }}
        onSubmit={ onSubmit }
    >

        { () => (
        <Form>
            <div className="">
            
            <div className="bg-gray-200 p-2 rounded-md grid grid-cols-1 md:grid-cols-3 gap-2 mx-2 mt-2 mb-1">

            <TextInput 
                            name="text"
                            placeholder="Nombre, Codigo o Efecto de la carta"
                            className="border-[1px] border-gray-300 rounded-md pl-2" 
                        />

            <MultiSelect
                name="products"
                options={products}
                placeholder="Productos"
                multi={true}
            />

            <MultiSelect
                name="rarities"
                options={rarities}
                placeholder="Rareza"
                multi={true}
            />

            {/* <MultiSelect
                name="orden"
                options={others}
                placeholder="Por precio"
                className=""
            /> */}
        
            </div>
           

            
            <div className="flex justify-center mx-2 mt-4 mb-10">
                <button type="submit" className="btn-primary w-full md:w-[200px] ">Buscar</button>
            </div>
            </div>
        </Form>
            
        )}


        </Formik>
  )
}
