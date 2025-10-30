'use server';

import {prisma} from "@/lib/prisma";

export const getAvatars = async() => {
    try {
        const avatars = await prisma.avatar.findMany({
            orderBy: [
                {
                    createdAt: "desc"
                },
            ],
        })
    
        return avatars;
        
    } catch (error) {
        throw new Error(`No se pudo cargar los avatares ${error}` );
    }
    

};