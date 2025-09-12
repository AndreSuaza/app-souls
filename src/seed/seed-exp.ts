
import { prisma } from '../lib/prisma';

const expData = [
   
   {
      "idd":"3501",
      "code":"ME5-001",
      "limit":"",
      "cost":5,
      "force":"2",
      "defense":"1",
      "name":"K-Replicator V.2",
      "effect":"Esta unidad es tratada como \"Alíen\". Al equipar, Rapta 1 unidad en el campo. (Pon la carta Raptada debajo de 1 \"Alíen\" que controles, máximo 1)",
      "typeIds":[
         "67c5d1585d56151173f8f220"
      ],
      "archetypesIds":[],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"6845",
      "code":"ME5-002",
      "limit":"",
      "cost":0,
      "force":"",
      "defense":"",
      "name":"Neurodraw",
      "effect":"Sacrifica 1 unidad \"Alíen\" que controles; roba 1 carta.",
      "typeIds":[
         "67c5d1585d56151173f8f21f"
      ],
      "archetypesIds":[],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":400
   },
   {
      "idd":"7744",
      "code":"ME5-003",
      "limit":"",
      "cost":4,
      "force":"3",
      "defense":"2",
      "name":"Ensayo Muscipula",
      "effect":"Rápido: selecciona 1 unidad \"Alíen\" 3\\2 qué controles; sacrifica esa unidad e inflige 1 daño a las vidas oponentes.",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"2314",
      "code":"ME5-004",
      "limit":"",
      "cost":1,
      "force":"0",
      "defense":"0",
      "name":"Ensayo Felidae",
      "effect":"Al invocar: puedes invocar de tu mazo 1 \"Ensayo Felidae\" a tu campo.",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"3790",
      "code":"ME5-006",
      "limit":"",
      "cost":6,
      "force":"2",
      "defense":"3",
      "name":"Zarh",
      "effect":"Al jugar: Rapta las unidades oponentes que sea posible. (Pon la carta Raptada debajo de 1 \"Alíen\" que controles, máximo 1)",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"1720",
      "code":"ME5-007",
      "limit":"",
      "cost":2,
      "force":"1",
      "defense":"2",
      "name":"Centinela Hueco",
      "effect":"Al jugar: revela 6 cartas del tope de tu mazo, agrega 1 \"Alíen\" o carta \"K-\" del las cartas reveladas. Devuelve las demás al fondo del mazo.",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"5296",
      "code":"ME5-008",
      "limit":"",
      "cost":3,
      "force":"",
      "defense":"",
      "name":"Falla Dimensional",
      "effect":"Al invocar: envía 2 cartas que mencionen \"Alíen\", 1 Arma y 1 Conjuro de tu mazo al cementerio; destruye esta carta e invoca 2 Fichas \"Alíen\" 3\\2 a tu campo.",
      "typeIds":[
         "67c5d1585d56151173f8f221"
      ],
      "archetypesIds":[],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"3654",
      "code":"ME5-009",
      "limit":"",
      "cost":1,
      "force":"",
      "defense":"",
      "name":"K-ask Vacío ",
      "effect":"Desintegra 1 \"Alíen\" de tu Limbo, cementerio o campo y selecciona 1 unidad con fuerza 2 o menos en el campo; niega sus efectos y los efectos que este activando este turno.",
      "typeIds":[
         "67c5d1585d56151173f8f21f"
      ],
      "archetypesIds":[],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f247"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":2400
   },
   {
      "idd":"0560",
      "code":"ME5-010",
      "limit":"",
      "cost":3,
      "force":"3",
      "defense":"2",
      "name":"Marix",
      "effect":"",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":400
   },
   {
      "idd":"2990",
      "code":"ME5-011",
      "limit":"",
      "cost":4,
      "force":"3",
      "defense":"2",
      "name":"Ranor",
      "effect":"Al jugar: puedes seleccionar 1 unidad Raptada que controles; envía esa unidad raptada al cementerio para invocar 1 Ficha \"Alíen\" 3\\2 a tu campo.",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"2112",
      "code":"ME5-012",
      "limit":"",
      "cost":2,
      "force":"",
      "defense":"",
      "name":"K-Pula Zarkon",
      "effect":"Al jugar: selecciona 1 Ente en el campo; Rapta ese Ente bajo esta carta. Fase de robo: pon un contador en esta carta, si tiene 4+ contadores destruye esta carta.",
      "typeIds":[
         "67c5d1585d56151173f8f221"
      ],
      "archetypesIds":[],
      "keywordsIds":[
         "687ed1cb7921881ae2ba01ee"
      ],
      "raritiesIds":["67c5d1595d56151173f8f247"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":3000
   },
   {
      "idd":"7012",
      "code":"ME5-014",
      "limit":"",
      "cost":3,
      "force":"3",
      "defense":"3",
      "name":"K-09",
      "effect":"Sacrifica 1 \"\" 0\\0 que controles, paga 2 Almas e invoca esta carta de tu mazo a tu campo. Defensor. Acción: Destruye esta carta, paga 3 Almas e invoca 1 \"K-19\" de tu mazo a tu campo. Defensor.",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[
         "67c5d1595d56151173f8f23e"
      ],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":3800
   },
   {
      "idd":"6645",
      "code":"ME5-015",
      "limit":"",
      "cost":6,
      "force":"",
      "defense":"",
      "name":"K-19",
      "effect":"Una vez por turno: destruye esta carta e invoca 1 unidad \"\" o \"Alíen\" de tu mano a tu campo ignorando su requerimiento, desintegra esa unidad cuando deje el campo.",
      "typeIds":[
         "67c5d1585d56151173f8f221"
      ],
      "archetypesIds":[],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f247"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":4000
   },
   {
      "idd":"8676",
      "code":"ME5-016",
      "limit":"",
      "cost":-1,
      "force":"5",
      "defense":"4",
      "name":"K-Norrath",
      "effect":"Requerimiento: Envía al cementerio 1 unidad Raptada que controles y 1 \"K-09\" que controles. Fase de Robo: Puedes invocar 1 ente \"K-19\" desde tu cementerio a tu Campo.",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "681a90e51b96fd1676c69492",
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f247"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":2400
   },
   {
      "idd":"1231",
      "code":"ME5-017",
      "limit":"",
      "cost":2,
      "force":"",
      "defense":"",
      "name":"Umbral de Zynthra",
      "effect":"Si no controlas cartas Raptadas y controlas  2+ unidades \"Alíen\": Rapta 1 unidad en el campo.",
      "typeIds":[
         "67c5d1585d56151173f8f21f",
         "67c5d1585d56151173f8f222"
      ],
      "archetypesIds":[],
      "keywordsIds":[
         "687ed1cb7921881ae2ba01ee"
      ],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"5572",
      "code":"ME5-018",
      "limit":"",
      "cost":1,
      "force":"0",
      "defense":"0",
      "name":"Fulgor Corrupto",
      "effect":"No puede ser objetivo de cartas. Paga 2 Almas; establece hasta 4 Almas pagadas como disponibles y destruye esta carta.",
      "typeIds":[
         "67c5d1585d56151173f8f21e",
         "67c5d1585d56151173f8f222"
      ],
      "archetypesIds":[
         "681a90e51b96fd1676c69492"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"9342",
      "code":"ME5-020",
      "limit":"",
      "cost":1,
      "force":"1",
      "defense":"3",
      "name":"Ensayo Bos taurus",
      "effect":"Requerimiento: controlar 1+ Ente \"Evento Cero\". Solo puedes controlar 1 \"Ensayo Bos taurus\".",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f244"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":18000
   },
   {
      "idd":"9696",
      "code":"ME5-021",
      "limit":"",
      "cost":2,
      "force":"",
      "defense":"",
      "name":"Area 52",
      "effect":"Requerimiento: Controlar 1+ unidades \"Alíen\". Fase de robo: puedes  1 unidad en el campo. (Pon la carta Raptada debajo de 1 \"Alíen\" que controles, máximo 1)",
      "typeIds":[
         "67c5d1585d56151173f8f221"
      ],
      "archetypesIds":[],
      "keywordsIds":[
         "687ed1cb7921881ae2ba01ee"
      ],
      "raritiesIds":["67c5d1595d56151173f8f243"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":16000
   },
   {
      "idd":"1201",
      "code":"ME5-022",
      "limit":"",
      "cost":4,
      "force":"5",
      "defense":"4",
      "name":"Modulak K-7",
      "effect":"Requerimiento: envía 2 unidades Raptadas que controles al cementerio.  Destrozar. (Si esta unidad ataca, inflige el excedente de fuerza a las vidas oponentes)",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[
         "67c5d1595d56151173f8f23f"
      ],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   },
   {
      "idd":"8006",
      "code":"ME5-024",
      "limit":"",
      "cost":3,
      "force":"2",
      "defense":"2",
      "name":"Zhy’Moth",
      "effect":"Acción: Selecciona 1 unidad Raptada que controles; envíala al cementerio e invoca una Ficha \"Alíen\" 3\\2 a tu campo.",
      "typeIds":[
         "67c5d1585d56151173f8f21e"
      ],
      "archetypesIds":[
         "67c5d1595d56151173f8f231"
      ],
      "keywordsIds":[],
      "raritiesIds":["67c5d1595d56151173f8f245"],
      "productId":"687ebf947921881ae2ba01e5",
      "price":600
   }

]

async function main() {


    
   try {
    
    expData.forEach( async(expDataCard) => {
       
        const cardIns = await prisma.card.create({
            data: {
                idd: expDataCard.idd,
                code: expDataCard.code,
                limit: expDataCard.limit,
                cost: expDataCard.cost,
                force: expDataCard.force,
                defense: expDataCard.defense,
                name: expDataCard.name,
                effect: expDataCard.effect,
                typeIds: expDataCard.typeIds,
                archetypesIds: expDataCard.archetypesIds,
                keywordsIds: expDataCard.keywordsIds,
                raritiesIds: expDataCard.raritiesIds,
                productId: expDataCard.productId,
            }
        });
    
        if(cardIns) {
            console.log(cardIns)
    
            const priceCardInt = await prisma.cardPrice.create({data: {
                price: expDataCard.price,
                rarityId: expDataCard.raritiesIds[0],
                cardId: cardIns.id
                }
            })
    
            console.log(priceCardInt);
        }

    })
    
   
    

   } catch (error) {
    console.log(error);
   }

    

    // console.log(cardIns);

    // await prisma.cardPrice.createMany({data:{
    //     price:28000,
    //     rarityId:"67c5d1595d56151173f8f244",
    //     cardId: cardIns.Card,
    // }})

}

(() => {
    if(process.env.NODE_ENV === 'production') return
    main();
})();


