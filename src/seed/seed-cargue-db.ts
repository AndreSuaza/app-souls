import { archetypesData, initialData, keywordsData, productsData, raritiesData, typesData } from "./seed-cargue";
import prisma from '../lib/prisma';



async function main() {

    
    // const {products} = productsData;

    // products.forEach(async (product) => {

    //     const { images, ...rest } = product;

    //     const dbProduct = await prisma.product.create({
    //         data: {
    //             ...rest
    //         }
    //     })


    //     const imagesData = images.map( image => ({
    //         url: image.url,
    //         alt: image.alt,
    //         productId: dbProduct.id
    //       }));
      
    //     await prisma.productImage.createMany({
    //         data: imagesData
    //     });

    // });
    

    //------------------------------------------------




    const typesDB = await prisma.type.findMany();
    const archetypesDB = await prisma.archetype.findMany();
    const keywordsDB = await prisma.keyword.findMany();
    const raritiesDB = await prisma.rarity.findMany();

    const prosMap = (props: any[], properties: string[]) => {

        const propsMap = props.reduce( (map, prop) => {
            map[ prop.name ] = prop.id;
            return map;
          }, {} as Record<string, string>); //<string=shirt, string=categoryID>

            
        const propertiesIds: string[] = [];

        properties.forEach( (properti, index) => {
            propertiesIds[index] = propsMap[properti];
        })

        return propertiesIds;
        
    }

    const rarityMap = raritiesDB.reduce( (map, prop) => {
        map[ prop.name ] = prop.id;
        return map;
      }, {} as Record<string, string>); //<string=shirt, string=categoryID>

    //Busca los PRODUCTS en base de datos y los mapea a la informacion de JSON
    const productsDB = await prisma.product.findMany();

    const productsMap = productsDB.reduce( (map, product) => {
        map[ product.code ] = product.id;
        return map;
    }, {} as Record<string, string>); //<string=shirt, string=categoryID>


    // //Inserta las CARDS
    const {cards} = initialData;

    cards.forEach(async (card) => {

        const { products, types, archetypes, keywords, rarity, price, cost, ...rest } = card;

        const dbCard = await prisma.card.create({
            data: {
              ...rest,
              productId: productsMap[products[0].code],
              typeIds: prosMap(typesDB, types),
              archetypesIds: prosMap(archetypesDB, archetypes),
              keywordsIds: prosMap(keywordsDB, keywords),
              raritiesIds: prosMap(raritiesDB, rarity),
              cost: Number.parseInt(cost),
            }
        })

        const dbPriceCard = await prisma.cardPrice.create({
            data: {
                price: price,
                rarityId: rarityMap[rarity[0]],
                cardId: dbCard.id
            }
        })

    });


    console.log('Ejecutado correctamente')

}


(() => {
    if(process.env.NODE_ENV === 'production') return
    main();
})();