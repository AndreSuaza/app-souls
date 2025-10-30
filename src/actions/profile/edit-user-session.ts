'use server';

import { auth } from "@/auth";
import {prisma} from "@/lib/prisma";

export const updateUser = async(img: string) => {

    const session = await auth();

    if(!session?.user.email) {
        throw new Error(`Error en la sesion`);
    }

    try {
        
        const user = await prisma.user.findUnique({           
            where: {
                email: session?.user.email
            }
        })
 
        if(!user) {
            throw new Error(`Error en la sesion del Usuario`);
        }

        if(user.image === img) {
            throw new Error(`No hay cambios en la imagen`);
        }

        await prisma.user.update({
            where: { id: user.id }, 
            data: {
                image: img
            },
        })

    } catch (error) {
        throw new Error(`Error en la sesion ${error}`);
    }
}