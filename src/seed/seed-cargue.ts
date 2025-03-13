
interface Card {
    idd: string;
    code: string;
    types: string[];
    limit: string;
    rarity: string[];
    cost: string;
    force: string;
    defense: string;
    archetypes: string[];
    keywords: string[];
    name: string;
    effect: string;
    products: ProductBase[];
    price: number;
}

interface Type {
  name: string;
}

interface Archetype {
  name: string;
}

interface Keyword {
  name: string;
}

interface Rarity {
  name: string;
}

interface ProductBase {
    code: string;
    name: string;
}

interface Product {
    index: number;
    code: string;
    name: string;
    releaseDate: string;
    description: string;
    url:string;
    numberCards: number;
    show: boolean;
    images: any[];
}

interface Store {
    name: string;        
    city: string;
    address: string;
    country: string;
    postalCode: string;
    phone: string;
    lat: number;
    lgn: number;  
    url: string; 
}

interface StoreTourname {
  name: string;        
}

interface TypeTournament {
    name: string;
}


export interface Tournament {
  title: string;  
  descripcion: string;
  url: string;
  lat: number;
  lgn: number;
  price: number;
  format: string;
  date: Date;
  TournamentImage: string;
  typeTournament: string;
  store: string
} 


export interface TournamentImage {
  id: string;
  url: string;
  alt: string;
}

interface CardsData {
    cards: Card[],
}

interface ProducstData {
    products: Product[],
}


interface TypesData {
    types: Type[],
}

interface ArchetypesData {
  archetypes: Archetype[],
}

interface RaritiesData {
  rarities: Rarity[],
}

interface KeywordsData {
  keywords: Keyword[],
}

interface StoresData {
  stores: Store[],
}

interface TournamentsData {
  tournaments: Tournament[],
}

interface TypesTournament {
  typesTournament: TypeTournament[],
}

export const keywordsData: KeywordsData = {
  keywords: [
    {
      "name": "Atraer"
    },
    {
      "name": "Defensor"
    },
    {
      "name": "Destrozar"
    },
    {
      "name": "Rashomon"
    },
    {
      "name": "Sed De Sangre"
    },
    {
      "name": ""
    }
  ]
}

export const archetypesData: ArchetypesData = {
    archetypes: [
      {
        "name": "Alíen"
      },
      {
        "name": "Ángel"
      },
      {
        "name": "Demonio"
      },
      {
        "name": "Espíritu"
      },
      {
        "name": "Humano"
      },
      {
        "name": "Alma"
      },
      {
        "name": "Mascota"
      },
      {
        "name": "Sátiro"
      },
      {
        "name": "Rashomon"
      },
      {
        "name": "Vampiro"
      },
      {
        "name": ""
      },
    ]
}

export const typesData: TypesData = {
  types: [
    {
      "name": "Unidad"
    },
    {
      "name": "Conjuro"
    },
    {
      "name": "Arma"
    },
    {
      "name": "Ente"
    },
    {
      "name": "Limbo"
    },
    {
      "name": "Alma"
    },
    {
      "name": "Ficha"
    },
  ]
}

export const raritiesData: RaritiesData = {
  rarities: [
    {
      "name": "Secreta"
    },
    {
      "name": "Ultra"
    },
    {
      "name": "Comun"
    },
    {
      "name": "Secreta Dorada"
    },
    {
      "name": "Rara"
    },
  ]
}

export const productsData: ProducstData = {
    products: [{
        "index": 12,
        "code": "MD2",
        "name": "Mazo de Demostracíon 2.0",
        "releaseDate": "Febrero 2024",
        "description": "El Mazo de Demostración – Alma Renacida de Souls In Xtinction TCG es la puerta de entrada perfecta para nuevos jugadores y una herramienta esencial para quienes buscan perfeccionar su estrategia.",
        "images": [
          {
            "alt": "logo mazo demostracion six",
            "url": "MD2"
          }
        ],
        "url": "mazo-demostracion-2",
        "numberCards": 27,
        "show": true
      }]
}

export const initialData: CardsData = {
    cards: [
        {
           "idd":"3211",
           "code":"MD2-001",
           "types":[
              "Ente"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"2",
           "force":"",
           "defense":"",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Aura Ígnea",
           "effect":"Puedes seleccionar 1 unidad que controles, destruye esta carta para darle +2/+2 este turno.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"0247",
           "code":"MD2-002",
           "types":[
              "Conjuro"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"5",
           "force":"",
           "defense":"",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Llamado del Hierro",
           "effect":"Invoca hasta 2 unidades de tu mano.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"7587",
           "code":"MD2-003",
           "types":[
              "Unidad"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"1",
           "force":"0",
           "defense":"1",
           "archetypes":[
              "Espíritu"
           ],
           "keywords":[
              ""
           ],
           "name":"Lince Lunar",
           "effect":"Al jugar: puedes invocar 1 \"Gato Lunar\" de tu mazo a tu campo.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"0044",
           "code":"MD2-004",
           "types":[
              "Unidad"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"2",
           "force":"3",
           "defense":"3",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Funtral",
           "effect":"Si controlas una unidad con algún arquetipo, esta unidad es destruida de inmediato. ",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"9895",
           "code":"MD2-007",
           "types":[
              "Unidad"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"4",
           "force":"4",
           "defense":"1",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Rugido del Cielo",
           "effect":"Puedes enviar 1 o más carta(s) de tu mano al cementerio para reducir el coste de esta carta en 1 por cada carta.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"1445",
           "code":"MD2-008",
           "types":[
              "Arma", "Limbo"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"2",
           "force":"2",
           "defense":"2",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Sangrefilo",
           "effect":"",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"6654",
           "code":"MD2-009",
           "types":[
              "Unidad"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"4",
           "force":"4",
           "defense":"4",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Zerk Inmortal",
           "effect":"Al invocar: roba 1 carta.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"6654",
           "code":"MD2-010",
           "types":[
              "Unidad"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"5",
           "force":"6",
           "defense":"6",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Urus Omnipotente",
           "effect":"",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"9841",
           "code":"MD2-011",
           "types":[
              "Arma"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"1",
           "force":"0",
           "defense":"-3",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Grilletes de Hierro",
           "effect":"",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"0331",
           "code":"MD2-012",
           "types":[
              "Unidad"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"1",
           "force":"",
           "defense":"",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"El Gran Estratega",
           "effect":"Una vez por turno: Agrega 1 unidad sin efecto de tu mazo a tu mano.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"0254",
           "code":"MD2-013",
           "types":[
              "Unidad"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"3",
           "force":"1",
           "defense":"1",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Fael Susurro Letal",
           "effect":"Al jugar: recibo +1/+1 por cada unidad que controles.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"0842",
           "code":"MD2-014",
           "types":[
              "Conjuro"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"5",
           "force":"",
           "defense":"",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Estocada de Fuego",
           "effect":"Selecciona 1 unidad oponente; destrúyela. Roba 1 carta.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"0354",
           "code":"MD2-015",
           "types":[
              "Ente"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"4",
           "force":"",
           "defense":"",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Coliseo del Juicio",
           "effect":"Fase final: cada jugador destruye la unidad con mayor fuerza que controle. (Si hay empate, el jugador escoge cual destruir)",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
          "price": 100
        },
        {
           "idd":"4451",
           "code":"MD2-016",
           "types":[
              "Ente", "Limbo"
           ],
           "limit":"",
           "rarity":["Comun"],
           "cost":"4",
           "force":"",
           "defense":"",
           "archetypes":[
              
           ],
           "keywords":[
              ""
           ],
           "name":"Baluarte Ardiente",
           "effect":"Puedes seleccionar 1 unidad en el campo; destruye está carta para destruir esa unidad.",
           "products":[
              {
                 "code":"MD2",
                 "name":"Mazo de Demostración 2.0"
              }
           ],
           "price": 100
        }
     ]
}

export const storeData: StoresData = {
  stores: [{
    "name": "Hidden TCG Store",
    "address": "Cl. 52 #24-18",
    "city": "Bogotá",
    "country": "Colombia",
    "lat": 4.641061151712014,
    "lgn": -74.07435758650631,
    "url": "", 
    "postalCode": "",
    "phone": "string",
  },
  {
    "name": "TCG Collectibles",
    "address": "Auto. Norte #120-77, Bogotá",
    "city": "Bogotá",
    "country": "Colombia",
    "lat": 4.702978522839585,
    "lgn": -74.05501083650137,
    "url": "", 
    "postalCode": "",
    "phone": "string",
  },
  {
    "name": "CLOVER TCG STORE",
    "address": "Calle 14 # 69-78",
    "city": "Cali",
    "country": "Colombia",
    "lat": 3.3938935852674077,
    "lgn": -76.53260481349368,
    "url": "", 
    "postalCode": "",
    "phone": "string",
  },
  {
    "name": "Excelsior Hobby Center",
    "address": "Cra 66 # 49A-26 Local 301 Suramericana",
    "city": "Medellín",
    "country": "Colombia",
    "lat": 6.2561282911513985,
    "lgn": -75.58232372883545,
    "url": "", 
    "postalCode": "",
    "phone": "string",
  }]
}

export const typeTournament: TypesTournament = {
  typesTournament: [
    {
      "name": "Tier 1"
    },
    {
      "name": "Tier 2"
    },
    {
      "name": "Tier 3"
    }
  ]
}

export const tournamentsData: TournamentsData = {
  tournaments: [{
    "title": "Souls Masters Circuit Clover TCG",
    "descripcion": "",
    "url": "souls-masters-circuit-clover-junio-2025",
    "lat": 0,
    "lgn": 0,
    "price": 48000,
    "format": "Masters",
    "date": new Date(),
    "typeTournament": "Tier 2",
    "store": "",
    "TournamentImage": "",
  },
  {
    "title": "Souls Masters Circuit Ecxelsior Hobby",
    "descripcion": "",
    "url": "souls-masters-circuit-clover-agosto-2025",
    "lat": 0,
    "lgn": 0,
    "price": 48000,
    "format": "Masters",
    "date": new Date(),
    "typeTournament": "Tier 2",
    "store": "",
    "TournamentImage": "",
  },
  ]
}