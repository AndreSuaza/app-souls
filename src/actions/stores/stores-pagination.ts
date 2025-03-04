'use server';

import prisma from "@/lib/prisma";

export const getStorePagination = async() => {
    try {
        const stores = await prisma.store.findMany({
            orderBy: [
                {
                    createDate: 'asc',
                },
            ],
        })
    
        return stores;
        
    } catch (error) {
        throw new Error(`No se pudo cargar los productos` );
    }
    

};