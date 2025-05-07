
import prisma from '../lib/prisma';

const expData = [
    {
       "idd":"4678",
       "code":"IMD-003",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Light pulse",
       "effect":"Si controlas 2+ unidades \"Dron\" selecciona 1 unidad en el campo; inflígele 2 daños.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"4332",
       "code":"IMD-004",
       "limit":"",
       "cost":3,
       "force":"",
       "defense":"",
       "name":"Dronódromo",
       "effect":"Tus unidades \"Dron\" cuestan 1 menos pero nunca 0.Fase de robo: tu oponente roba 1 carta, luego envía 1 carta al azar de su mano al cementerio.",
       "typeIds":[
          "67c5d1585d56151173f8f221",
          "67c5d1585d56151173f8f222"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":4400
    },
    {
       "idd":"3030",
       "code":"IMD-005",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Hora De La Siesta",
       "effect":"Si tú oponente tiene la ficha de ataque: selecciona 1 unidad en el campo; duérmela.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":24000
    },
    {
       "idd":"3033",
       "code":"IMD-006",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Rastro del Amanecer",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":200
    },
    {
       "idd":"9732",
       "code":"IMD-007",
       "limit":"",
       "cost":0,
       "force":"",
       "defense":"",
       "name":"Equilibrio de Almas",
       "effect":"Selecciona 1 unidad en el campo; inflige 2 daños a esa unidad, luego pierdes 1 vida por cada unidad que controles más que tu oponente.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":6000
    },
    {
       "idd":"1145",
       "code":"IMD-008",
       "limit":"",
       "cost":0,
       "force":"6",
       "defense":"8",
       "name":"Nerathos",
       "effect":"Requerimiento: ser invocado por el efecto de 1 \"Acechador Nocturno\". Al invocar: establece 2 Almas pagadas como disponibles. Fase de robo: pon esta unidad en tu zona de Almas como 1 Alma disponible.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":3000
    },
    {
       "idd":"2144",
       "code":"IMD-009",
       "limit":"",
       "cost":1,
       "force":"0",
       "defense":"0",
       "name":"Germen de Muerte",
       "effect":"No puede ser objetivo de cartas. Paga 3 Almas; destruye esta carta e invoca 1 \"Nerathos\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":15000
    },
    {
       "idd":"6034",
       "code":"IMD-010",
       "limit":"",
       "cost":5,
       "force":"3",
       "defense":"4",
       "name":"Acechador Nocturno",
       "effect":"Al jugar: establece 1 Alma pagada como disponible. Paga 3 Almas; destruye esta carta e invoca 1 \"Nerathos\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1200
    },
    {
       "idd":"3301",
       "code":"IMD-011",
       "limit":"",
       "cost":4,
       "force":"3",
       "defense":"3",
       "name":"Furia Creciente",
       "effect":"Defensor. (No puede atacar) Paga 3 Almas; destruye esta carta e invoca 1 \"Ignisthorn\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23e"
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":2200
    },
    {
       "idd":"5930",
       "code":"IMD-012",
       "limit":"",
       "cost":0,
       "force":"6",
       "defense":"4",
       "name":"Ignisthorn",
       "effect":"Debe ser invocado por efecto de 1 \"Furia Creciente\". Al invocar y Fase de robo: destruye la unidad con menor fuerza que controle tu oponente (Si hay empate, tu eliges).",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":28000
    },
    {
       "idd":"8723",
       "code":"IMD-013",
       "limit":"",
       "cost":1,
       "force":"0",
       "defense":"0",
       "name":"Núcleo Ardiente",
       "effect":"No puede ser objetivo de cartas. Paga 2 Almas; destruye esta carta e invoca 1 \"Furia Creciente\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1600
    },
    {
       "idd":"1776",
       "code":"IMD-014",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Alzamiento Dracónico",
       "effect":"Selecciona 2 unidades \"Dragón\" en tu cementerio; agrega esas unidades a tu mano.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1200
    },
    {
       "idd":"3086",
       "code":"IMD-015",
       "limit":"",
       "cost":1,
       "force":"0",
       "defense":"1",
       "name":"Iskra, Susurrante ",
       "effect":"Si esta carta es enviada de tu mano al cementerio: puedes invocarla a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"3087",
       "code":"IMD-016",
       "limit":"",
       "cost":1,
       "force":"1",
       "defense":"0",
       "name":"Caballero olvidado ",
       "effect":"Si esta carta es enviada de tu mano al cementerio: puedes invocarla a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"3089",
       "code":"IMD-017",
       "limit":"",
       "cost":2,
       "force":"2",
       "defense":"1",
       "name":"Doncella Rota",
       "effect":"Si esta carta es enviada de tu mano al cementerio: puedes invocarla a tu campo. Defensor. (No puede atacar)",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":3600
    },
    {
       "idd":"4023",
       "code":"IMD-018",
       "limit":"",
       "cost":2,
       "force":"0",
       "defense":"0",
       "name":"Semilla Primordial",
       "effect":"No puede ser objetivo de cartas. Paga 2 Almas; destruye esta carta e invoca 1 \"Garra de la Tierra\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":2800
    },
    {
       "idd":"7790",
       "code":"IMD-019",
       "limit":"",
       "cost":4,
       "force":"1",
       "defense":"3",
       "name":"Garra de la Tierra",
       "effect":"Paga 1 Alma; invoca 1 \"Gaiaroth\" de tu mazo o tu mano al tu campo. Fase de robo: recupera 1 de tus vidas.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":22000
    },
    {
       "idd":"8065",
       "code":"IMD-020",
       "limit":"",
       "cost":6,
       "force":"3",
       "defense":"4",
       "name":"Gaiaroth",
       "effect":"Defensor. (No puede atacar) Cualquier daño que fuera a ser infligido a tus vidas lo recibe esta unidad inmediatamente.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23e"
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":24000
    },
    {
       "idd":"1301",
       "code":"IMD-021",
       "limit":"",
       "cost":1,
       "force":"1",
       "defense":"1",
       "name":"Cuidador de huevos",
       "effect":"Al jugar: puedes agregar 1 unidad \"Dragón\" 0/0 de tu mazo a tu mano.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f235"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1400
    },
    {
       "idd":"4934",
       "code":"IMD-022",
       "limit":"",
       "cost":3,
       "force":"",
       "defense":"",
       "name":"Último Rugido",
       "effect":"Selecciona 1 unidad en el campo que su fuerza sea diferente a su original; destrúyela.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":3200
    },
    {
       "idd":"5667",
       "code":"IMD-023",
       "limit":"",
       "cost":2,
       "force":"",
       "defense":"",
       "name":"El Asedio del Tesoro",
       "effect":"Si controlas 2+ unidades \"Dragón\" activa 1 de los siguientes efectos: * Selecciona 1 Ente coste 3 o menos en el campo; destruyelo. * Roba 2 cartas.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":25000
    },
    {
       "idd":"2675",
       "code":"IMD-024",
       "limit":"",
       "cost":1,
       "force":"0",
       "defense":"0",
       "name":"Fragmento del Vacío",
       "effect":"No puede ser objetivo de cartas. Paga 3 Almas; destruye esta carta e invoca 1 \"Portador Oscuro\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1600
    },
    {
       "idd":"6305",
       "code":"IMD-025",
       "limit":"",
       "cost":4,
       "force":"2",
       "defense":"4",
       "name":"Portador Oscuro",
       "effect":"Rápido: una vez por duelo, si tú oponente activa el efecto de 1 unidad en el campo; puedes negar ese efecto y sus efectos en el campo, hasta el final del turno.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":20000
    },
    {
       "idd":"6895",
       "code":"IMD-026",
       "limit":"",
       "cost":0,
       "force":"6",
       "defense":"6",
       "name":"Noctharys",
       "effect":"Requerimientos: * \"Portador Oscuro\" haya activado su efecto. * Sacrifica 1 \"Dragon\" que controles. Niega los efectos que activen las unidades oponentes.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":16000
    },
    {
       "idd":"7546",
       "code":"IMD-027",
       "limit":"",
       "cost":0,
       "force":"",
       "defense":"",
       "name":"Arrullo De Dragón ",
       "effect":"Si controlas 1+ unidades \"Dragón\" y no controlas unidades en tu zona de combate, selecciona unidades oponentes en su zona de combate hasta el número de unidades \"Dragón\" que controles; duermelas.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":3400
    },
    {
       "idd":"2667",
       "code":"IMD-028",
       "limit":"",
       "cost":1,
       "force":"2",
       "defense":"1",
       "name":"ApagaDron",
       "effect":"Al invocar; duerme esta unidad. (Las unidades dormidas no pueden atacar o defender). Solo puedes invocar 1 \"ApagaDron\" por turno.",
       "typeIds":[
          "67c5d1585d56151173f8f21e",
          "67c5d1585d56151173f8f222"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":20000
    },
    {
       "idd":"3730",
       "code":"IMD-029",
       "limit":"",
       "cost":6,
       "force":"2",
       "defense":"2",
       "name":"DestructDron",
       "effect":"Reduce el costo de esta carta en 1 por cada unidad \"Dron\" que controles. Al jugar: tu oponente envía su mano al cementerio y roba 6 cartas.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":26000
    },
    {
       "idd":"5512",
       "code":"IMD-030",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"AceleraDron",
       "effect":"Si controlas 2+ unidades \"Dron\": tu oponente roba 2 cartas por cada \"Dron\" que controles, luego envía cartas al azar de su mano al cementerio igual a la cantidad de cartas que el robo +1.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":3000
    },
    {
       "idd":"3212",
       "code":"IMD-031",
       "limit":"",
       "cost":0,
       "force":"",
       "defense":"",
       "name":"Alimento de Dragon",
       "effect":"Si vas a pagar Almas para activar el efecto de 1 \"Dragón\", puedes enviar esta carta al cementerio como pago de 1 de esas Almas.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"7112",
       "code":"IMD-032",
       "limit":"",
       "cost":2,
       "force":"2",
       "defense":"1",
       "name":"Vaelion",
       "effect":"Al jugar: puedes agregar 1 \"Alimento para dragones\" de tu mazo a tu mano. Si 1 \"Dragón\" paga Almas para activar su efecto, esta carta recibe +1/+1.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":4200
    },
    {
       "idd":"7702",
       "code":"IMD-033",
       "limit":"",
       "cost":2,
       "force":"",
       "defense":"",
       "name":"Voluntad Divina",
       "effect":"Selecciona 1 \"Aleksandra\" que controles y 1 unidad oponente; esa \"Aleksandra\" le inflige 2 daños a la unidad oponente y recibe \"Destrozar\". ",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23f"
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":30000
    },
    {
       "idd":"7554",
       "code":"IMD-034",
       "limit":"",
       "cost":2,
       "force":"1",
       "defense":"3",
       "name":"Ashborn",
       "effect":"Defensor. Mientras controles otra unidad \"Dragón\", esta carta recibe Sed de sangre.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23e",
          "67c5d1595d56151173f8f241"
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1600
    },
    {
       "idd":"4421",
       "code":"IMD-035",
       "limit":"",
       "cost":2,
       "force":"3",
       "defense":"2",
       "name":"Aliento de dragón",
       "effect":"Solo se puede equipar a un \"Dragón\". ",
       "typeIds":[
          "67c5d1585d56151173f8f220"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":600
    },
    {
       "idd":"1011",
       "code":"IMD-036",
       "limit":"",
       "cost":3,
       "force":"2",
       "defense":"3",
       "name":"Señal fantasma ",
       "effect":"Solo se puede equipar a 1 \"Dron\". Mientras controles otra unidad \"Dron\", esta carta no puede ser objetivo de cartas.",
       "typeIds":[
          "67c5d1585d56151173f8f220"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"5532",
       "code":"IMD-037",
       "limit":"",
       "cost":2,
       "force":"1",
       "defense":"2",
       "name":"Zyrrak el Abismal",
       "effect":"Una vez por turno: puedes pagar [1] Alma; esta carta recibe +1/+1.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1400
    },
    {
       "idd":"6843",
       "code":"IMD-038",
       "limit":"",
       "cost":3,
       "force":"2",
       "defense":"3",
       "name":"Kaerros",
       "effect":"Rápido: envia 1 Conjuro sin efecto de tu mano al cementerio y selecciona 1 unidad oponente; inflige 2 daños a esa unidad.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":12000
    },
    {
       "idd":"9443",
       "code":"IMD-039",
       "limit":"",
       "cost":1,
       "force":"1",
       "defense":"1",
       "name":"Morvax ",
       "effect":"Al jugar: selecciona 2 cartas Conjuro sin efecto en tu cementerio; agrégaos a tu mano.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1600
    },
    {
       "idd":"7340",
       "code":"IMD-040",
       "limit":"",
       "cost":2,
       "force":"1",
       "defense":"1",
       "name":"Aldaba del Juicio",
       "effect":"Solo se puede equipar a una unidad \"Rashomon\". Una vez por turno: puedes seleccionar 1 \"Tajomaru\" en tu cementerio; agregalo a tu Limbo. Destrozar.",
       "typeIds":[
          "67c5d1585d56151173f8f220"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
            "67c5d1595d56151173f8f240",
            "67c5d1595d56151173f8f23f"
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":2800
    },
    {
       "idd":"9164",
       "code":"IMD-041",
       "limit":"",
       "cost":2,
       "force":"3",
       "defense":"2",
       "name":"Castillo De Mil Llaves",
       "effect":"Fase de robo: puedes agregar 1 unidad \"Rashomon\" de tu mazo a tu mano. (Las unidades Rashomon no pueden atacar ni defender).",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f239"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f240"
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1200
    },
    {
       "idd":"4599",
       "code":"IMD-042",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Recepción Maldita",
       "effect":"Selecciona 1 unidad \"Rashomon\" que controles y 1 unidad oponente; el \"Rashomon\" inflige daño a la unidad oponente igual a su fuerza.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":18000
    },
    {
       "idd":"3889",
       "code":"IMD-043",
       "limit":"",
       "cost":3,
       "force":"2",
       "defense":"4",
       "name":"Ekoar ",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1600
    },
    {
       "idd":"5033",
       "code":"IMD-044",
       "limit":"",
       "cost":2,
       "force":"",
       "defense":"",
       "name":"Ruina Ardiente",
       "effect":"Fase final: pon 1 contador en esta carta. Fase de robo: si esta carta tiene 3 contadores, destrúyela e inflige 2 daños a TODAS las unidades en el campo.",
       "typeIds":[
          "67c5d1585d56151173f8f221"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1600
    },
    {
       "idd":"3072",
       "code":"IMD-045",
       "limit":"",
       "cost":3,
       "force":"4",
       "defense":"5",
       "name":"Tronco Espiritual",
       "effect":"esta unidad es tratada como \"Rashomon\". Puedes enviar 1 Conjuro de tu mano al cementerio y negar los efectos de esta carta.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f234"
       ],
       "keywordsIds":[
            "67c5d1595d56151173f8f240"
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":6000
    },
    {
       "idd":"4799",
       "code":"IMD-046",
       "limit":"",
       "cost":8,
       "force":"5",
       "defense":"4",
       "name":"IV. Seraphael",
       "effect":"Reduce el costo de esta carta en 1 por cada unidad destruida este turno. Al jugar: puedes seleccionar 1 unidad en tu cementerio que fue destruida este turno; invocala a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f232"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":18000
    },
    {
       "idd":"5209",
       "code":"IMD-047",
       "limit":"",
       "cost":2,
       "force":"",
       "defense":"",
       "name":"Bendición Eternus",
       "effect":"Selecciona 1 unidad en el campo; recibe +1/+1 hasta el final del turno, por cada Ente que controles.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":200
    },
    {
       "idd":"7433",
       "code":"IMD-048",
       "limit":"",
       "cost":2,
       "force":"",
       "defense":"",
       "name":"Despertar Vermicular",
       "effect":"Selecciona 1 Ficha que controles; invoca 2 unidades Ficha con su fuerza y defensa originales de la Ficha que seleccionaste.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1400
    },
    {
       "idd":"8642",
       "code":"IMD-049",
       "limit":"",
       "cost":2,
       "force":"",
       "defense":"",
       "name":"Potion Shop",
       "effect":"Puedes activar cada efecto SOLO 1 vez pagando las Almas requeridas: [1] Roba 1 carta. [2] Selecciona 1 unidad en el campo; infligele 2 daños. [4] Selecciona 1 unidad en el campo; destrúyela.",
       "typeIds":[
          "67c5d1585d56151173f8f221"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":20000
    },
    {
       "idd":"8574",
       "code":"IMD-050",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Velo Dracónico",
       "effect":"Fase de robo: puedes destruir esta carta y por el resto del turno, tus unidades \"Dragón\" no pueden ser objetivo de conjuros.",
       "typeIds":[
          "67c5d1585d56151173f8f221",
          "67c5d1585d56151173f8f222"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":4600
    },
    {
       "idd":"3021",
       "code":"IMD-052",
       "limit":"",
       "cost":3,
       "force":"1",
       "defense":"2",
       "name":"Chispaescamas",
       "effect":"Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta)Si esta carta destruye 1 unidad por batalla, recibe 1 contador +1/+1.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492", "67c5d1595d56151173f8f237"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23d"
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":4200
    },
    {
       "idd":"4011",
       "code":"IMD-053",
       "limit":"",
       "cost":3,
       "force":"2",
       "defense":"3",
       "name":"Fungido Tóxico",
       "effect":"Al jugar: selecciona 1 unidad dormida en el campo; destrúyela.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f234"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":2600
    },
    {
       "idd":"8330",
       "code":"IMD-054",
       "limit":"",
       "cost":6,
       "force":"4",
       "defense":"5",
       "name":"Errante de Almas ",
       "effect":"Rápido: devuelve 2 Almas a tu mazo de Almas; establece 2 Almas pagadas como disponibles.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f234"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"5746",
       "code":"IMD-055",
       "limit":"",
       "cost":4,
       "force":"4",
       "defense":"4",
       "name":"Portón de los Caídos",
       "effect":"Fase de robo: establece 1 Alma disponible de tu oponente como pagada. (Las unidades Rashomon no pueden atacar ni defender).",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f239"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f240"
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":24000
    },
    {
       "idd":"8309",
       "code":"IMD-056",
       "limit":"",
       "cost":2,
       "force":"1",
       "defense":"1",
       "name":"Alma sellada",
       "effect":"Los efectos base de esta unidad son negados.",
       "typeIds":[
          "67c5d1585d56151173f8f220"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":400
    },
    {
       "idd":"3690",
       "code":"IMD-057",
       "limit":"",
       "cost":1,
       "force":"1",
       "defense":"2",
       "name":"Penumbra Rota",
       "effect":"Requerimiento: controlar 1 vampiro. Fase de robo: inflige 2 daños a esta unidad. Sed de sangre. (Todo el daño que esta carta inflige, te cura)",
       "typeIds":[
          "67c5d1585d56151173f8f220"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f241"
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1200
    },
    {
       "idd":"4171",
       "code":"IMD-058",
       "limit":"",
       "cost":4,
       "force":"",
       "defense":"",
       "name":"Estallido Bélico",
       "effect":"Destruye TODAS las unidades equipadas en el campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":1400
    },
    {
       "idd":"5097",
       "code":"IMD-059",
       "limit":"",
       "cost":2,
       "force":"2",
       "defense":"3",
       "name":"Soulfeaster",
       "effect":"Requerimiento: paga 2 vidas para jugar esta carta. Sed de sangre.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f23a"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f241"
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":30000
    },
    {
       "idd":"4201",
       "code":"IMD-060",
       "limit":"",
       "cost":0,
       "force":"0",
       "defense":"0",
       "name":"Piko",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f234"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":5600
    },
    {
       "idd":"341",
       "code":"IMD-061",
       "limit":"",
       "cost":1,
       "force":"0",
       "defense":"0",
       "name":"Garras de Dragón",
       "effect":"Solo se puede equipar a un \"Dragón\". Selecciona 1 unidad en el campo; destruye esta arma e inflige daño a esa unidad igual al ataque de esta carta.",
       "typeIds":[
          "67c5d1585d56151173f8f220"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f247"],
       "productId":"681a718c1b96fd1676c69482",
       "price":3600
    },
    {
       "idd":"8605",
       "code":"IMD-062",
       "limit":"",
       "cost":2,
       "force":"1",
       "defense":"1",
       "name":"Golem Salamandra",
       "effect":"Defensor. Fase de robo: pon un contador en esta carta. Fase final:  puedes seleccionar 1 unidad en el campo e inflígele daños igual a la cantidad de contadores en esta carta.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23e"
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"5071",
       "code":"IMD-063",
       "limit":"",
       "cost":3,
       "force":"3",
       "defense":"4",
       "name":"Torguestad",
       "effect":"Defensor.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f234"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23e"
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":800
    },
    {
       "idd":"9504",
       "code":"IMD-064",
       "limit":"",
       "cost":0,
       "force":"0",
       "defense":"1",
       "name":"Spiny, Golden Shell",
       "effect":"Defensor. (No puede atacar)  Solo puedes invocar 1 \"defensor gratis\" por turno.",
       "typeIds":[
          "67c5d1585d56151173f8f21e",
          "67c5d1585d56151173f8f222"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":16000
    },
    {
       "idd":"1078",
       "code":"IMD-065",
       "limit":"",
       "cost":6,
       "force":"9",
       "defense":"6",
       "name":"Sombra Voraz",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":600
    },
    {
       "idd":"4306",
       "code":"IMD-066",
       "limit":"",
       "cost": -1,
       "force":"",
       "defense":"",
       "name":"Reinos de Llama y Hueso",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f223"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":16000
    },
    {
       "idd":"5520",
       "code":"IMD-067",
       "limit":"",
       "cost":2,
       "force":"0",
       "defense":"0",
       "name":"Nucleo Álmico",
       "effect":"Esta unidad es tratada como \"Dron\". Sus estadísticas se establecen en 2/2.",
       "typeIds":[
          "67c5d1585d56151173f8f220"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":400
    },
    {
       "idd":"6868",
       "code":"IMD-068",
       "limit":"",
       "cost":1,
       "force":"1",
       "defense":"0",
       "name":"Estraker",
       "effect":"Si solo controlas 2+ unidades sin arquetipo, puedes invocar esta carta de tu mazo sin pagar su coste.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f233"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":34000
    },
    {
       "idd":"862",
       "code":"IMD-069",
       "limit":"",
       "cost":-1,
       "force":"",
       "defense":"",
       "name":"Esencia del Harvum",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f223"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":400
    },
    {
       "idd":"863",
       "code":"IMD-070",
       "limit":"",
       "cost":-1,
       "force":"",
       "defense":"",
       "name":"Volcarius Ingnis",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f223"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":400
    },
    {
       "idd":"457",
       "code":"IMD-071",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Grito de la Conquista",
       "effect":"Agrega 1 unidad sin efecto de tu mazo a tu mano",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f245"],
       "productId":"681a718c1b96fd1676c69482",
       "price":200
    },
    {
       "idd":"9732",
       "code":"IMD-072",
       "limit":"",
       "cost":0,
       "force":"",
       "defense":"",
       "name":"Equilibrio de Almas",
       "effect":"Selecciona 1 unidad en el campo; inflige 2 daños a esa unidad, luego pierdes 1 vida por cada unidad que controles más que tu oponente.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":32000
    },
    {
       "idd":"1145",
       "code":"IMD-073",
       "limit":"",
       "cost":0,
       "force":"6",
       "defense":"8",
       "name":"Nerathos",
       "effect":"Requerimiento: ser invocado por el efecto de 1 \"Acechador Nocturno\". Al invocar: establece 2 Almas pagadas como disponibles. Fase de robo: pon esta unidad en tu zona de Almas como 1 Alma disponible.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":24000
    },
    {
       "idd":"3301",
       "code":"IMD-074",
       "limit":"",
       "cost":4,
       "force":"3",
       "defense":"3",
       "name":"Furia Creciente",
       "effect":"Defensor. (No puede atacar) Paga 3 Almas; destruye esta carta e invoca 1 \"Ignisthorn\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
          "67c5d1595d56151173f8f23e"
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":20000
    },
    {
       "idd":"4023",
       "code":"IMD-075",
       "limit":"",
       "cost":2,
       "force":"0",
       "defense":"0",
       "name":"Semilla Primordial",
       "effect":"No puede ser objetivo de cartas. Paga 2 Almas; destruye esta carta e invoca 1 \"Garra de la Tierra\" de tu mazo o mano a tu campo.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":25000
    },
    {
       "idd":"7112",
       "code":"IMD-076",
       "limit":"",
       "cost":2,
       "force":"2",
       "defense":"1",
       "name":"Vaelion",
       "effect":"Al jugar: puedes agregar 1 \"Alimento para dragones\" de tu mazo a tu mano. Si 1 \"Dragón\" paga Almas para activar su efecto, esta carta recibe +1/+1.",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "681a90e51b96fd1676c69492"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f243"],
       "productId":"681a718c1b96fd1676c69482",
       "price":28000
    },
    {
       "idd":"3012",
       "code":"IMD-077",
       "limit":"",
       "cost":-1,
       "force":"",
       "defense":"",
       "name":"Reino de Ignisthorn",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f223"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":12000
    },
    {
       "idd":"3076",
       "code":"IMD-078",
       "limit":"",
       "cost":0,
       "force":"",
       "defense":"",
       "name":"Cuervo",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f224"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":10000
    },
    {
       "idd":"331",
       "code":"IMD-079",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"El Gran Estratega",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f244"],
       "productId":"681a718c1b96fd1676c69482",
       "price":14000
    },
    {
       "idd":"4201",
       "code":"IMD-080",
       "limit":"",
       "cost":0,
       "force":"0",
       "defense":"0",
       "name":"Piko",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f21e"
       ],
       "archetypesIds":[
          "67c5d1595d56151173f8f234"
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f246"],
       "productId":"681a718c1b96fd1676c69482",
       "price":38000
    },
    {
       "idd":"8574",
       "code":"IMD-081",
       "limit":"",
       "cost":1,
       "force":"",
       "defense":"",
       "name":"Velo Dracónico",
       "effect":"Fase de robo: puedes destruir esta carta y por el resto del turno, tus unidades \"Dragón\" no pueden ser objetivo de conjuros.",
       "typeIds":[
          "67c5d1585d56151173f8f221",
          "67c5d1585d56151173f8f222"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f246"],
       "productId":"681a718c1b96fd1676c69482",
       "price":48000
    },
    {
       "idd":"7546",
       "code":"IMD-082",
       "limit":"",
       "cost":0,
       "force":"",
       "defense":"",
       "name":"Arrullo De Dragón ",
       "effect":"Si controlas 1+ unidades \"Dragón\" y no controlas unidades en tu zona de combate, selecciona unidades oponentes en su zona de combate hasta el número de unidades \"Dragón\" que controles; duermelas.",
       "typeIds":[
          "67c5d1585d56151173f8f21f"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f246"],
       "productId":"681a718c1b96fd1676c69482",
       "price":36000
    },
    {
       "idd":"6600",
       "code":"IMD-083",
       "limit":"",
       "cost": -1,
       "force":"",
       "defense":"",
       "name":"Soul Draconis",
       "effect":"",
       "typeIds":[
          "67c5d1585d56151173f8f223"
       ],
       "archetypesIds":[
       ],
       "keywordsIds":[
       ],
       "raritiesIds":["67c5d1595d56151173f8f246"],
       "productId":"681a718c1b96fd1676c69482",
       "price":36000
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


