'use server';

import prisma from "@/lib/prisma";

interface PaginationOptions {
    page?: number;
    take?: number;
    text?: string;
    products?: string[];
    types?: string[];
    archetypes?: string[];
    keywords?: string[];
    costs?: string[];
    forces?: string[];
    defenses?: string[];
    raritys?: string[];
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

        const whereConstruction = () => {
            const where:any = {};
            if(products) {
                where.product = {
                    code: {
                        in: products
                    }
                }
            }
            if(types) { where.typeIds = {hasEvery: types}}
            if(archetypes) { where.archetypesIds = {hasEvery: archetypes}}
            if(keywords) { where.keywordsIds = {hasEvery: keywords}}
            if(costs) { where.cost = {in: costs}}
            if(forces) { where.force = {in: forces}}
            if(defenses) { where.defense = {in: defenses}}
            if(raritys) { where.raritiesIds = {hasEvery: raritys}}

            return where;
        }

        // const whesre =  {
        //     product: {
        //         code: {
        //             in: ["ME1"]
        //         }
        //     },
        //     typeIds: {
        //         hasEvery: []
        //     },
        //     archetypesIds: {
        //         hasEvery: []
        //     },
        //     keywordsIds: {
        //         hasEvery: []
        //     },
        //     cost: {
        //         in: costs
        //     },
        //     force: {
        //         in: forces
        //     },
        //     defense: {
        //         in: defenses
        //     },
        //     raritiesIds: {
        //         hasEvery: []
        //     }, 
        // }

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
                product: card.productId
            }))

        }

    } catch (error) {
        throw new Error('No se pudo cargar las cartas ');
    }
}