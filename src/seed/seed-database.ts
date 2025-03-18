
import prisma from '../lib/prisma';
import { initialData } from "./seed-users";

async function main() {
   
    await prisma.user.deleteMany()    

    const { users } = initialData

    await prisma.user.createMany({
        data: users
    });

}

(() => {
    if(process.env.NODE_ENV === 'production') return
    main();
})();