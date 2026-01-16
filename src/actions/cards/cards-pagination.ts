'use server';

import {prisma} from "@/lib/prisma";

interface WhereClause {
    product?: { code: { in: string[] } };
    typeIds?: { hasEvery: string[] };
    archetypesIds?: { hasEvery: string[] };
    keywordsIds?: { hasEvery: string[] };
    cost?: { in: number[] };
    force?: { in: string[] };
    defense?: { in: string[] };
    raritiesIds?: { hasEvery: string[] };
    limit?: { in: string[] };
    OR?: Array<{
        effect?: { contains: string; mode: "insensitive" };
        idd?: { equals: string; mode: "insensitive" };
        name?: { contains: string; mode: "insensitive" };
    }>;
    
}

interface PaginationOptions {
    page?: number;
    take?: number;
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


export const getPaginatedCards = async({
    page = 1,
    take = 30,
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    rarities,
    limit,
}: PaginationOptions) => {
    
    if( isNaN( Number(page))) page = 1;
    if( page < 1) page = 1;

    try {

        const whereConstruction = () => {
            const where: WhereClause = {};
            if(products) {
                where.product = {
                    code: {
                        in: products.split(',').map(item => item.trim())
                    }
                }
            }
            if(types) { where.typeIds = {hasEvery: types.split(',').map(item => item.trim())}}
            if(archetypes) { where.archetypesIds = {hasEvery: archetypes.split(',').map(item => item.trim())}}
            if(keywords) { where.keywordsIds = {hasEvery: keywords.split(',').map(item => item.trim())}}
            if(costs) { where.cost = {in: costs.split(',').map(item => Number.parseInt(item.trim()))}}
            if(forces) { where.force = {in: forces.split(',').map(item => item.trim())}}
            if(defenses) { where.defense = {in: defenses.split(',').map(item => item.trim())}}
            if(text) {
                where.OR = [
                    { effect: { contains: text, mode: "insensitive" } },
                    { idd: { equals: text, mode: "insensitive" } },
                    { name: { contains: text, mode: "insensitive" } },
                ]
            }
            if(rarities) { where.raritiesIds = {hasEvery: rarities.split(',').map(item => item.trim())}}
            if(limit) { where.limit = {in: limit.split(',').map(item => item.trim())}}
            return where;
        }

        const cards = await prisma.card.findMany({
            take:30,
            skip: (page -1) * take,
            include: {
                product: {
                    select: {
                        name: true,
                        code: true,
                        show: true,
                        url: true,
                    }
                },
                types: {
                    select: {
                        name: true,
                    }
                },
                keywords: {
                    select: {
                        name: true,
                    }
                },
                rarities: {
                    select: {
                        name: true,
                    }
                },
                archetypes: {
                    select: {
                        name: true,
                    }
                },
                price: {
                    include: {
                        rarity: true
                    },
                    orderBy: {
                        price: "asc",
                    },
                    distinct: ["rarityId"]
                }
            },
            where: whereConstruction(),
            orderBy: [
                {
                    id: 'desc',
                },
            ],
        })
        
        const totalCount = await prisma.card.count({
            where: whereConstruction(),
        })
        const totalPages = Math.ceil( totalCount / take );

        return {
            currentPage: page,
            totalPage: totalPages,
            totalCount,
            perPage: take,
            cards: cards.map( card => ({
                ...card,
                price: card.price.map(p => {return {price: p.price, rarity: p.rarity.name}})
            }))
        }

    } catch (error) {
        throw new Error(`No se pudo cargar las cartas ${error}`);
    }
}
