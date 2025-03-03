'use server';

import prisma from "@/lib/prisma";


export const getTournamenttUrl = async(url: string) => {

    try {

        const tournament = await prisma.tournament.findFirst({
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,     
                        city: true,
                        address: true,
                        country: true,
                        postalCode: true,
                        phone: true,
                        lat: true,
                        lgn: true,
                        url: true,
                        createDate: true,
                    }
                },
                typeTournament: {
                    select: {
                        id: true,
                        name: true,
                    }
                },
                TournamentImage: {
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

        if(!tournament) return null;

        return {
            ...tournament,
            images: tournament.TournamentImage.map( image => image.url )
        };
        
    } catch (error) {
        throw new Error(`No se pudo cargar el torneo con la URL: ${url}` );
    }

    

   

};