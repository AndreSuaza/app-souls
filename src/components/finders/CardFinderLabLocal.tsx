'use client';

import { Form, Formik } from "formik";
import { MultiSelect, TextInput } from "../form";
import { useState } from "react";
import { IoFilterSharp } from "react-icons/io5";

interface Propertie {
    id: string,
    name: string,
  }

interface Properties {
    products: Propertie[],
    types: Propertie[],
    archetypes: Propertie[],
    keywords: Propertie[],
    rarities: Propertie[],
}

interface PropertiesFiltersFinderLab {
    text: string,
    products: Propertie[],
    types: Propertie[],
    archetypes: Propertie[],
    keywords: Propertie[],
    rarities: Propertie[],
    force: Propertie[],
    defense: Propertie[],
    cost: Propertie[],
    limit: Propertie[],
}

export interface PaginationFilters {
    text?: string;
    products?: string;
    types?: string;
    archetypes?: string;
    keywords?: string;
    costs?: string;
    forces?: string;
    defenses?: string;
    rarities?: string;
    limit?: string;
}

interface Props {
    propertiesCards: Properties;
    cols: number;
    onSearch: (filters: PaginationFilters) => void;
}

interface SelectProps {
    name: string;
    id: string;
}

export const CardFinderLabLocal = ({propertiesCards, cols=6, onSearch}: Props) => {

    const colsGrid = () => {
      switch (cols) {
        case 6:
          return 'grid grid-cols-1 md:grid-cols-6 gap-2 mx-4 transition-all bg-gray-200 p-2 rounded-lg mb-2 md:mb-6'
        case 2:
          return 'grid grid-cols-1 md:grid-cols-2 gap-2 mx-4 transition-all bg-gray-200 p-2 rounded-lg mb-2 md:mb-6'
        default:
          return 'grid grid-cols-1'
      }
    } 

    const [showFilters, setShowFilters] = useState(false);
    const [properties] =  useState({
        types: propertiesCards.types.map((prop:SelectProps) => {return {label: prop.name, value: prop.id }}),
        others: [{label: 0, value: 0},{label: 1, value: 1},{label: 2, value: 2},{label: 3, value: 3},{label: 4, value: 4},{label: 5, value: 5},{label: 6, value: 6},{label: 7, value: 7},{label: 8, value: 8},{label: 9, value: 9},{label: 10, value: 10}],
        archetypes: propertiesCards.archetypes.map((prop:SelectProps) => {return {label: prop.name, value: prop.id }}),
        keywords: propertiesCards.keywords.map((prop:SelectProps) => {return {label: prop.name, value: prop.id }}),
        products: propertiesCards.products.map((prop:SelectProps) => {return {label: `${prop.name} [${prop.id}]`, value: prop.id }}),
        rarities: propertiesCards.rarities.map((prop:SelectProps) => {return {label: `${prop.name}`, value: prop.id }}),
        });

    const {types, others, archetypes, keywords, products, rarities} = properties;
    
    const getFilterValues = (filter: Propertie[]) => {
        let values = "";
    
        filter.forEach((value, index) => {
          values += index < filter.length -1 ? value+"," : value
        });
    
        return values;
    }

    function capitalizeWords(inputString: string): string {
        const words = inputString.split(' ');
        const capitalizedWords = words.map((word) => {
            if (word.length > 0) {
            return word.charAt(0).toUpperCase() + word.slice(1);
            }
            return word;
        });
        return capitalizedWords.join(' ');
    }

    const buildFilters = (filters: PropertiesFiltersFinderLab): PaginationFilters => { 
        const nextFilters: PaginationFilters = {};

        if (filters.text && filters.text !== "") nextFilters.text = capitalizeWords(filters.text);
        if (filters.types.length > 0) nextFilters.types = getFilterValues(filters.types);
        if (filters.force.length > 0) nextFilters.forces = getFilterValues(filters.force);
        if (filters.archetypes.length > 0) nextFilters.archetypes = getFilterValues(filters.archetypes);
        if (filters.products.length > 0) nextFilters.products = getFilterValues(filters.products);
        if (filters.cost.length > 0) nextFilters.costs = getFilterValues(filters.cost);
        if (filters.defense.length > 0) nextFilters.defenses = getFilterValues(filters.defense);
        if (filters.keywords.length > 0) nextFilters.keywords = getFilterValues(filters.keywords);
        if (filters.rarities.length > 0) nextFilters.rarities = getFilterValues(filters.rarities);
        if (filters.limit.length > 0) nextFilters.limit = getFilterValues(filters.limit);

        return nextFilters;
    };

    const onSubmit = (filters: PropertiesFiltersFinderLab) => {
        const nextFilters = buildFilters(filters);
        onSearch(nextFilters);
    }

  return (
    <Formik 
        initialValues={{
            text: '',
            types: [],
            cost: [],
            force: [],
            defense: [],
            archetypes: [],
            keywords: [],
            products: [],
            rarities: [],
            limit: [],
        }}
        onSubmit={ onSubmit }
    >

        { () => (
        <Form>
            <div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mx-2 mt-2 md:mt-6 mb-1">
                
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
        
            </div>
            <div 
                className="flex flex-row justify-end uppercase font-bold mx-2 mb-2 text-sm"
                onClick={() => setShowFilters(!showFilters)}
            >
                {showFilters ? "ocultar filtros" : "ver filtros"}
            <IoFilterSharp className="w-4 h-4 ml-2"  />
            </div>
            
            { showFilters &&
            <div className={colsGrid()}>

                <MultiSelect
                  name="cost"
                  options={others}
                  placeholder="Costo"
                  multi={true}
                />
  
                <MultiSelect
                    name="force"
                    options={others}
                    placeholder="Fuerza"
                    multi={true}
                />
  
                <MultiSelect
                    name="defense"
                    options={others}
                    placeholder="Defensa"
                    multi={true}
                />

                
  
                <MultiSelect
                    name="types"
                    options={types}
                    placeholder="Tipo"
                    multi={true}
                />
  
                <MultiSelect
                    name="archetypes"
                    options={archetypes}
                    placeholder="Arquetipo"
                    multi={true}
                />
  
                <MultiSelect
                    name="keywords"
                    options={keywords}
                    placeholder="Palabras Clave"
                    multi={true}
                />

                <MultiSelect
                    name="rarities"
                    options={rarities}
                    placeholder="Rareza"
                    multi={true}
                />

                <MultiSelect
                    name="limit"
                    options={[{label: "Legendaria", value: 1}]}
                    placeholder="Legendarias"
                    multi={true}
                />
  
            </div>
            }
            <div className="flex justify-center mx-2">
                <button type="submit" className="btn-primary w-full md:w-[200px] ">Buscar</button>
            </div>
            </div>
        </Form>
            
        )}


        </Formik>
  )
}
