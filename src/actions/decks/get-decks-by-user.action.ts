'use server';

import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

export const getDecksByUser = async() => {

     const session = await auth();

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
                userId: session?.user.id
            }
        })

        return decks;
        

    } catch (error) {
        throw new Error(`Error en la sesion ${error}`);
    }
}