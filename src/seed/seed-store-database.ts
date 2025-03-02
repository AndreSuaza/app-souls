import { storeData } from "./seed";
import prisma from '../lib/prisma';



async function main() {

    await prisma.store.deleteMany()

    const {stores} = storeData;

    await prisma.store.createMany({
            data: stores
    });

}

(() => {
    if(process.env.NODE_ENV === 'production') return
    main();
})();