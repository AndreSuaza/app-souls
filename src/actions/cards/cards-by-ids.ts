'use server';

import prisma from "@/lib/prisma";


export const getCardsByIds = async(ids: string[]) => {

    try {

        const cards = await prisma.card.findMany({
            where: {
                id: {
                    in: ids
                }
            }
        })
        
        return cards;

    } catch (error) {
        throw new Error('No se pudo cargar las cartas ');
    }
}