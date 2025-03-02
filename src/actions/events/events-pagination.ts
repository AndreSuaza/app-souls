'use server';

import prisma from "@/lib/prisma";

export const getEventsPagination = async() => {
    try {
        const products = await prisma.product.findMany({
            include: {
                ProductImage: {
                    select: {
                        id: true,
                        url: true,
                        alt: true,
                    }
                }
            },
            where: {
                show: true
            },
            orderBy: [
                {
                    createDate: 'desc',
                },
            ],
        })
    
        return products;
        
    } catch (error) {
        throw new Error(`No se pudo cargar los productos` );
    }
    

};