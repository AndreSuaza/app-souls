'use server';

import prisma from "@/lib/prisma";


export const getCardsByProductId = async(id:string) => {


    if(!id) return [];

    try {

        const cards = await prisma.card.findMany({
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
            where: {
                productId: id
            }
        })

        return cards.map( card => ({
            ...card,
            price: card.price.map(p => {return {price: p.price, rarity: p.rarity.name}})
        }))

    } catch (error) {
        throw new Error(`No se pudo cargar las cartas ${error}`);
    }
}