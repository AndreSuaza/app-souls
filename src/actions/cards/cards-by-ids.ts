'use server';

import { Decklist } from "@/interfaces/decklist.interface";
import prisma from "@/lib/prisma";


export const getCardsByIds = async(ids: string | undefined) => {


    if(!ids) return [];

    let deck: Decklist[] = [];
    const idds = ids.split(',');

    try {

        const cards = await prisma.card.findMany({
            distinct:"idd",
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
            where: {
                idd: {
                    in: idds
                }
            }
        })
        
        cards.map(card => {
            deck = [...deck, 
                {
                    card: {
                        id: card.id,
                        idd: card.idd,
                        code: card.code,
                        types: card.types,
                        limit: card.limit,
                        rarities: card.rarities,
                        cost: card.cost,
                        force: card.force,
                        defense: card.defense,
                        archetypes: card.archetypes,
                        keywords: card.keywords,
                        name: card.name,
                        effect: card.effect,
                        product: card.productId,
                        price: card.price[0].price,
                    }
                , count: Number.parseInt(idds[idds.indexOf(card.idd)+1])
            } ]
        })

        return deck;

    } catch (error) {
        throw new Error('No se pudo cargar las cartas ');
    }
}