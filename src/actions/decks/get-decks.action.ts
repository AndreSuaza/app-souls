'use server';

import {prisma} from "@/lib/prisma";

export const getDecks = async() => {

    try {
        
        const decks = await prisma.deck.findMany({ 
            include: {
                user: {
                    select: {
                        nickname: true,
                    }
                },
                archetype: {
                    select: {
                        name: true,
                    }
                },
            },          
            where: {
                visible: true,
                cardsNumber: 40,
            }
        })

        return decks;
        

    } catch (error) {
        throw new Error(`Error en la sesion ${error}`);
    }
}