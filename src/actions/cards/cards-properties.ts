'use server';

import prisma from "@/lib/prisma";

export const getPropertiesCards = async() => {

    try {

        const products = await prisma.product.findMany({
            select: {
                id: true,
                name: true,
                code: true,
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
    
        const types = await prisma.type.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: [
                {
                    name: 'asc',
                },
            ],
        })
    
        const archetypes = await prisma.archetype.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: [
                {
                    name: 'asc',
                },
            ],
        })
    
        const keywords = await prisma.keyword.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: [
                {
                    name: 'asc',
                },
            ],
        })
    
        const rarities = await prisma.rarity.findMany({
            select: {
                id: true,
                name: true,
            },
            orderBy: [
                {
                    name: 'asc',
                },
            ],
        })
    
        return {
            products,
            types,
            archetypes,
            keywords,
            rarities,
        }
        
    } catch (error) {
        throw new Error(`No se pudo cargar alguna de las propiedades de la carta ${error}` );    
    }

    
};