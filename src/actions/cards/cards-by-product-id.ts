'use server';

import { Decklist } from "@/interfaces/decklist.interface";
import prisma from "@/lib/prisma";


export const getCardsByProductId = async(id:string) => {


    if(!id) return [];

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
                productId: id
            }
        })

        return cards.map( card => ({
            ...card,
            product: card.productId,
            price: card.price[0].price
        }))

    } catch (error) {
        throw new Error('No se pudo cargar las cartas ');
    }
}