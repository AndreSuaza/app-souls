

import { prisma } from "../lib/prisma";
import { initialData } from "./seed-users";

// Evita depender de tipos de Node para este script de seed.
declare const process: { env: { NODE_ENV?: string } };

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
