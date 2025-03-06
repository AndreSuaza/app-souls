'use server';

import prisma from "@/lib/prisma";

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
    raritys?: string;
}


export const getPaginatedCards = async({
    page = 1,
    take = 12,
    text,
    products,
    types,
    archetypes,
    keywords,
    costs,
    forces,
    defenses,
    raritys,
}: PaginationOptions) => {
    
    if( isNaN( Number(page))) page = 1;
    if( page < 1) page = 1;

    try {
        console.log(defenses?.split(',').map(item => item.trim()));
        const whereConstruction = () => {
            const where:any = {};
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

            return where;
        }

        const cards = await prisma.card.findMany({
            take:12,
            skip: (page -1) * take,
            include: {
                product: {
                    select: {
                        name: true,
                        code: true,
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
                    select: {
                        price: true,
                    }
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
            cards: cards.map( card => ({
                ...card,
                product: card.productId,
                price: card.price[0].price
            }))

        }

    } catch (error) {
        throw new Error(`No se pudo cargar las cartas ${error}`);
    }
}