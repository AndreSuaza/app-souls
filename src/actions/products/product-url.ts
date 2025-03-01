'use server';

import prisma from "@/lib/prisma";
import { ProductImage } from '../../interfaces/products.interface';


export const getProductUrl = async(url: string) => {

    try {

        const product = await prisma.product.findFirst({
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
                url: url
            },
        })     

        if(!product) return null;

        return {
            ...product,
            images: product.ProductImage.map( image => image.url )
        };
        
    } catch (error) {
        throw new Error(`No se pudo cargar el product con la URL: ${url}` );
    }

    

   

};