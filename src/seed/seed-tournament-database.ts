
import prisma from '../lib/prisma';
import { tournamentsData, typeTournament } from './seed';





async function main() {

    // await prisma.typeTournament.deleteMany()

    // const {typesTournament} = typeTournament;

    // await prisma.typeTournament.createMany({
    //         data: typesTournament
    // });

    await prisma.tournament.deleteMany()

    const {tournaments} = tournamentsData;

    const typesTournamentDB = await prisma.typeTournament.findMany();

    const typesTournamentMap = typesTournamentDB.reduce( (map, type) => {
        map[ type.name ] = type.id;
        return map;
      }, {} as Record<string, string>); //<string=shirt, string=categoryID>
      

    const storesDB = await prisma.store.findMany();

    const storesMap = storesDB.reduce( (map, store) => {
        map[ store.name ] = store.id;
        return map;
      }, {} as Record<string, string>); //<string=shirt, string=categoryID>

    const tournamentImageDB = await prisma.tournamentImage.findMany();

    const tournamentImageMap = tournamentImageDB.reduce( (map, image) => {
        map[ image.alt ] = image.id;
        return map;
    }, {} as Record<string, string>); //<string=shirt, string=categoryID>
      

    const event = await prisma.tournament.create({
        data: {
            
                title: "Souls Masters Circuit Clover TCG",
                descripcion: "",
                url: "souls-masters-circuit-clover-junio-2025",
                lat: 0,
                lgn: 0,
                price: 48000,
                format: "Masters",
                date: new Date(),
                typeTournamentId: typesTournamentMap["Tier 2"],
                storeId: storesMap["Hidden TCG Store"],
        },
      });


    await prisma.tournamentImage.create({
        data: {
            alt: "Souls Master Circuit Cali",
            tournamentId: event.id,
            url: "SMCC.webp"
        }
    });

}

(() => {
    if(process.env.NODE_ENV === 'production') return
    main();
})();