


export interface Type {
    name: string;
    id?: string;
    createDate?: Date;
}

export interface Archetype {
    name: string;
    id?: string;
    createDate?: Date;
}

export interface Rarity {
    name: string;
    id?: string;
}

export interface Keyword {
    name: string;
    id?: string;
    createDate?: Date;
}

interface Product {
    code: string;
    name: string;
    show: boolean;
    url: string;
}

interface Price {

    price: number;
    rarity: string;

} 

export interface Card {
    id: string;
    idd: string;
    code: string;
    types: Type[];
    limit: string;
    rarities: Rarity[];
    cost: number;
    force: string;
    defense: string;
    archetypes: Archetype[];
    keywords: Keyword[];
    name: string;
    effect: string;
    product: Product;
    price: Price[];
}

