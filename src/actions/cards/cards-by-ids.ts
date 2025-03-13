'use server';

import prisma from "@/lib/prisma";


export const getCardsByIds = async(ids: string | undefined) => {


    if(!ids) return [];

    const idds = ids.split(',');

    try {

        const cards = await prisma.card.findMany({
            distinct:"idd",
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
                        id: true,
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
                idd: {
                    in: idds
                }
            }
        })

        return cards.map(card => {return {card: card, count: Number.parseInt(idds[idds.indexOf(card.idd)+1])}});

    } catch (error) {
        throw new Error(`No se pudo cargar las cartas ${error}`);
    }
}