'use server';

import prisma from "@/lib/prisma";


export const getCardsAndPrices = async() => {


    try {

        const cards = await prisma.card.findMany({
            include: {
                product: {
                    select: {
                        name: true,
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
            orderBy: [
                {
                    id: 'desc',
                },
            ],
        })

        return cards.map(card => [
            
            card.idd,
            card.code,
            card.name,
            card.price[0].price,
            card.product.name,
            
        ]);

    } catch (error) {
        throw new Error(`No se pudo cargar las cartas ${error}`);
    }
}