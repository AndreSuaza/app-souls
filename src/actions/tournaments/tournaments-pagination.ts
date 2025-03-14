'use server';

import prisma from "@/lib/prisma";

interface PaginationOptions {
    page?: number;
    take?: number;
    types: string[];
}

export const getTournamentsPagination = async({page = 1,take = 12, types}: PaginationOptions) => {

    if( isNaN( Number(page))) page = 1;
    if( page < 1) page = 1;

    try {

       

        const tournaments = await prisma.tournament.findMany({
            take:12,
            skip: (page -1) * take,
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
                typeTournament: {
                    name: {
                        in: types
                    }
                }
            },  
            orderBy: [
                {
                    createDate: 'desc',
                }
            ],
        })
    
        const totalCount = await prisma.tournament.count({
            where: {
                typeTournament: {
                    name: {
                        in: types
                    }
                }
            },  
        })
        const totalPages = Math.ceil( totalCount / take );


        return {
            currentPage: page,
            totalPage: totalPages,
            tournaments

        }
        
    } catch (error) {
        throw new Error(`No se pudo cargar los Torneos ${error}` );
    }
    

};