'use server';

import prisma from "@/lib/prisma";

interface PaginationOptions {
    page?: number;
    take?: number;
    products?: string;
    rarities?: string;
    orden?: string;
}


export const getPaginatedPricesCards = async({
    page = 1,
    take = 24,
    products,
    rarities,
    orden = "desc",
}: PaginationOptions) => {
    
    if( isNaN( Number(page))) page = 1;
    if( page < 1) page = 1;

    try {

        const whereConstruction = () => {
            const where: Record<string, any> = {};
            if(products) {
                where.product = {
                    code: {
                        in: products.split(',').map(item => item.trim())
                    }
                }
            }
            if(rarities) { where.raritiesIds = {hasEvery: rarities.split(',').map(item => item.trim())}}
            //if(text) {where.OR = [{ effect: { contains: text } },{ idd: text }, {name: {contains: text}}]}
            return where;
        }

        const cards = await prisma.card.findMany({
            take: take,
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
                    include: {
                        rarity: true
                    },
                    orderBy: {
                        price: 'asc'
                    }
                    ,
                    distinct: ["rarityId"]
                }
            },
            where: whereConstruction(),
            orderBy: [
                {
                    id: 'desc',
                }
            ],
        })
        
        const totalCount = await prisma.card.count({
            where: whereConstruction(),
        })
        const totalPages = Math.ceil( totalCount / take );

        return {
            currentPage: page,
            totalPage: totalPages,
            cards: cards,

        }

    } catch (error) {
        throw new Error(`No se pudo cargar las cartas ${error}`);
    }
}