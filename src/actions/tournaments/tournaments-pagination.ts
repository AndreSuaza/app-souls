'use server';

import prisma from "@/lib/prisma";

export const getTournamentsPagination = async() => {
    try {
        const tournament = await prisma.tournament.findMany({
            include: {
                store: {
                    select: {
                        id: true,
                        name: true,
                        lat: true,
                        lgn: true,
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
            orderBy: [
                {
                    createDate: 'desc',
                },
            ],
        })
    
        return tournament;
        
    } catch (error) {
        throw new Error(`No se pudo cargar los Torneos` );
    }
    

};