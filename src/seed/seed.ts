

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
    descripcion: string;
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
    length: string;
    latitude: string;  
    url: string; 
}

interface TypeEvent {
    name: string;
}

interface Event {
    id: string;
    title: string;
    descripcion: string;
    url: string;
    typeEvent: TypeEvent;
    length?: string;
    latitude?: string; 
    price: string;
    format: string;
    date: Date;
    store: Store;
}

interface CardsData {
    cards: Card[],
}

interface ProducstData {
    products: Product[],
}

interface EventsData {
    events: Event[],
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
        "index": 5,
        "code": "ME4",
        "name": "Mazo Humanos - Despliegue  de la Armada",
        "releaseDate": "Ago 2024",
        "descripcion": "Mazo Humanos tendras todas las armanas necesarias para aniquilar a tu enemigo.",
        "images": [
          {
            "alt": "logo Mazo Humanos six",
            "url": "ME4"
          }
        ],
        "url": "mazo-humanos",
        "numberCards": 48,
        "show": true
      },
      {
        "index": 1,
        "code": "MD1",
        "name": "Mazo De Demostración - Primer Estallido",
        "releaseDate": "Ago 2024",
        "descripcion": "mazo de demostracion para iniciar en el mundo del six.",
        "images": [
          {
            "alt": "logo Mazo Humanos six",
            "url": "MD1"
          }
        ],
        "url": "mazo-demostracion",
        "numberCards": 27,
        "show": true
      },
      {
        "index": 2,
        "code": "ME1",
        "name": "Mazo Demonios - Arte de la Destrucción",
        "releaseDate": "Ago 2024",
        "descripcion": "Mazo Demonios su gran numero y agresividad caracterizticas nesesarias para destruir a tu oponente.",
        "images": [
          {
            "alt": "logo Mazo Demonios six",
            "url": "ME1"
          }
        ],
        "url": "mazo-demonios",
        "numberCards": 49,
        "show": true
      },
      {
        "index": 3,
        "code": "ME2",
        "name": "Mazo Ángeles - Amanecer Celestial",
        "releaseDate": "Ago 2024",
        "descripcion": "Mazo Angeles Lleva todo el control de la justicia a tus manos.",
        "images": [
          {
            "alt": "logo Mazo Angeles six",
            "url": "ME2"
          }
        ],
        "url": "mazo-angeles",
        "numberCards": 48,
        "show": true
      },
      {
        "index": 4,
        "code": "ME3",
        "name": "Mazo Espíritus - El Árbol de la Vida",
        "releaseDate": "Ago 2024",
        "descripcion": "Mazo Espíritus cada minuto que pasa drenara esperanza a tu oponente hasta llevarte a la victoria.",
        "images": [
          {
            "alt": "logo Mazo Espíritus six",
            "url": "ME3"
          }
        ],
        "url": "mazo-espiritus",
        "numberCards": 52,
        "show": true
      },
      {
        "index": 6,
        "code": "PGC",
        "name": "Cartas Promocionales Génesis del Caos",
        "releaseDate": "Ago 2024",
        "descripcion": "Promocionales de torneos de la temporada Génesis del Caos.",
        "images": [
          {
            "alt": "Promo Génesis del Caos",
            "url": "PGC"
          }
        ],
        "url": "promo-genesis-del-caos",
        "numberCards": 5,
        "show": false
      },
      {
        "index": 7,
        "code": "PGCC",
        "name": "Carta de Campeón Génesis del Caos",
        "releaseDate": "Ago 2024",
        "descripcion": "Carta promocional para el campeon del torneo de inicio de temporada Génesis del Caos.",
        "images": [
          {
            "alt": "Promo Campeón Génesis del Caos",
            "url": "PGCC"
          }
        ],
        "url": "promo-genesis-del-caos",
        "numberCards": 1,
        "show": false
      },
      {
        "index": 8,
        "code": "LP",
        "name": "Producto Especial - Leyendas Peludas",
        "releaseDate": "Oct 2024",
        "descripcion": "Producto Especial Souls In Xtinction",
        "images": [
          {
            "alt": "logo Leyendas Peludas",
            "url": "LP"
          }
        ],
        "url": "leyendas-peludas",
        "numberCards": 25,
        "show": true
      },
      {
        "index": 9,
        "code": "GNC",
        "name": "Génesis del Caos",
        "releaseDate": "Dic 2024",
        "descripcion": "Expansión Souls In Xtinction",
        "images": [
          {
            "alt": "logo Génesis del Caos",
            "url": "GNC"
          }
        ],
        "url": "genesis-del-caos",
        "numberCards": 77,
        "show": true
      },
      {
        "index": 10,
        "code": "SMC01",
        "name": "Souls Masters Circuit",
        "releaseDate": "Dic 2024",
        "descripcion": "Sobre Souls Masters Circuit",
        "images": [
          {
            "alt": "logo Sobre Souls Masters Circuit",
            "url": "SMC01"
          }
        ],
        "url": "sobre-souls-masters-circuit",
        "numberCards": 25,
        "show": false
      },
      {
        "index": 11,
        "code": "EDA",
        "name": "Ecos del Abismo",
        "releaseDate": "Feb 2025",
        "descripcion": "Nuevo producto especial ecos del abismo.",
        "images": [
          {
            "alt": "logo Ecos del Abismo",
            "url": "EDA"
          }
        ],
        "url": "ecos-del-Abismo",
        "numberCards": 22,
        "show": true
      }]
}

export const initialData: CardsData = {
    cards: [{
        "idd": "1449",
        "code": "ME1-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [
          "Defensor"
        ],
        "name": "DefensOgro",
        "effect": "Defensor. (No puede ser Atacante durante el Combate)",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1000
      },
      {
        "idd": "8377",
        "code": "ME1-002",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Demonio",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Bakeneko",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1600
      },
      {
        "idd": "3410",
        "code": "ME1-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "DemoniOgro",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 2800
      },
      {
        "idd": "1649",
        "code": "ME1-004",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Trueno a las 300",
        "effect": "Si hay 4+ unidades en el campo, selecciona 1 de ellas; inflige 3 daños a esa unidad.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1000
      },
      {
        "idd": "1419",
        "code": "ME1-005",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Escape del infierno",
        "effect": "Descarta 1 unidad de tu mano y selecciona 1 unidad en tu cementerio; Retorna esa unidad.(Devuelve la carta especifica a la mano de su dueño)",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 800
      },
      {
        "idd": "3196",
        "code": "ME1-006",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "2",
        "defense": "0",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Agares",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 2800
      },
      {
        "idd": "2899",
        "code": "ME1-007",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Posesión Demoníaca",
        "effect": "Soy tratado como 'Demonio'.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1000
      },
      {
        "idd": "8862",
        "code": "ME1,4-008",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Sepulturero jubilado",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1600
      },
      {
        "idd": "3933",
        "code": "ME1-009",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "SaiPaimon",
        "effect": "Si esta unidad es destruida en batalla, inflige 1 daño a la vida del oponente.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1400
      },
      {
        "idd": "9078",
        "code": "ME1-010",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Grieta Infernal",
        "effect": "Invoca hasta 2 Fichas 'Demonio' 1/0.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1400
      },
      {
        "idd": "6392",
        "code": "ME1-011",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Duo Diablillos",
        "effect": "Si esta unidad es destruida, invoca 1 Ficha 'Demonio' 1/0.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1400
      },
      {
        "idd": "5604",
        "code": "ME1,2-012",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Fantasma merodeador",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1000
      },
      {
        "idd": "6072",
        "code": "ME1,4-013",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Escudos gemelos",
        "effect": "Selecciona hasta 2 unidades en el campo; Reciben +0/+2 durante este turno.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1800
      },
      {
        "idd": "1862",
        "code": "ME1,2-014",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Granada de Goma",
        "effect": "Al Infligir Daño, retorna al portador de esta arma. (Devuelve el portador a la mano de su dueño)",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 600
      },
      {
        "idd": "1100",
        "code": "ME1-015",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Semyazza",
        "effect": "Al Jugar: Revela 6 cartas del tope de tu mazo, agrega 1 'Demonio' de las cartas reveladas. Devuelve las demás cartas al fondo de tu mazo.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1600
      },
      {
        "idd": "6879",
        "code": "ME1-016",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Sigilo de Satanás",
        "effect": "Las unidades 'Demonio' que controles cuando resuelva esta carta, reciben +1/+1, durante este turno.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1000
      },
      {
        "idd": "5803",
        "code": "ME1,2-017",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "2",
        "defense": "3",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Imp Redimido",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 400
      },
      {
        "idd": "9268",
        "code": "ME1,4-018",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "3",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Predicador del Pecado",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "7074",
        "code": "ME1-020",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Sed Demoníaca",
        "effect": "Selecciona 1 'Demonio' que controles y 1 unidad oponente; Destruye ese Demonio para destruir la unidad oponente.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 800
      },
      {
        "idd": "0060",
        "code": "ME1,4-019",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Pastel Podrido",
        "effect": "Selecciona 1 unidad en el campo; inflige 1 Daño a esa unidad.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 4000
      },
      {
        "idd": "7692",
        "code": "ME1,2-021",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "4",
        "defense": "4",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Bracco",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 400
      },
      {
        "idd": "2300",
        "code": "ME1,4-022",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "3",
        "defense": "4",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Demonio Pastelero",
        "effect": "Al Invocar: Puedes agregar un 'Pastel Podrido' de tu mazo a tu mano.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1000
      },
      {
        "idd": "0349",
        "code": "ME1,2,3,4-023",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Purificador de Almas",
        "effect": "Selecciona 2 unidades en el campo; inflige 2 daños a esas unidades.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          },
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          },
          {
            "code": "ME3",
            "name": "Mazo Espirítus - El Árbol de la Vida"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 2600
      },
      {
        "idd": "9427",
        "code": "ME1-024",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Pentagrama invertido",
        "effect": "Invoca hasta 3 Fichas 'Demonio' 1/0. Las unidades 'Demonio' que controles cuando resuelva esta carta reciben +1/+0 este turno.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1000
      },
      {
        "idd": "7116",
        "code": "ME1-025",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "3",
        "defense": "2",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Bahamoot Aniquilador",
        "effect": "Al Jugar: Puedes destruir los demás 'Demonios' que controles, inflige 1 daño a las vidas del oponente por cada 'Demonio' destruido.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1000
      },
      {
        "idd": "5513",
        "code": "ME1-026",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "0",
        "force": "3",
        "defense": "2",
        "archetypes": [
          "Sátiro"
        ],
        "keywords": [""],
        "name": "Sátiro de la Triada",
        "effect": "Requerimiento: Controlar 3+ unidades 'Demonio'. Solo puedes controlar 1 'Sátiro de la Triada'.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 12000
      },
      {
        "idd": "6618",
        "code": "ME1-027",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "5",
        "defense": "3",
        "archetypes": [
          "Sátiro"
        ],
        "keywords": [
          "Destrozar"
        ],
        "name": "Mammon",
        "effect": "Requerimiento: Controlar 5 unidades 'Demonio'. Destrozar.(Si esta unidad ataca, inflige el excedente de fuerza a las vidas del oponente)",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 8000
      },
      {
        "idd": "0499",
        "code": "ME1-028",
        "types": [
          "Ficha"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Ficha Duo Diablillo",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1200
      },
      {
        "idd": "6611",
        "code": "ME1-029",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Maná Demonio",
        "effect": "",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 1200
      },
      {
        "idd": "5161",
        "code": "ME2-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Rocky",
        "effect": "Mientras controles a 'Ginger' recibo +2/+0.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 400
      },
      {
        "idd": "3720",
        "code": "ME2-002",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Volviendo a Casa",
        "effect": "Selecciona 1 de tus unidades en el campo; Retornala. (Devuelve la carta específica a la mano de su dueño)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1600
      },
      {
        "idd": "5560",
        "code": "ME2-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Ángel",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Ginger",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1600
      },
      {
        "idd": "5842",
        "code": "ME2-004",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Volando al Más Allá",
        "effect": "La siguiente unidad que sea retornada en este turno, es Desintegrada.(Las cartas desintegradas, son enviadas boca abajo al Halo)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 600
      },
      {
        "idd": "3822",
        "code": "ME2-005",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Receta de Brujas",
        "effect": "Descarta 1 conjuro de tu mano al cementerio y selecciona 1 conjuro en tu cementerio; Retornalo. (Devuelve la carta específica a la mano de su dueño)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 600
      },
      {
        "idd": "9446",
        "code": "ME2-006",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [
          "Defensor"
        ],
        "name": "Protector del Amanecer",
        "effect": "Defensor. (No puede ser Atacante durante el Combate)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1000
      },
      {
        "idd": "0152",
        "code": "ME2-007",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Alas Sagradas",
        "effect": "Soy tratado como 'Ángel'.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1000
      },
      {
        "idd": "7455",
        "code": "ME2-008",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "2",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Piuressa",
        "effect": "",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 400
      },
      {
        "idd": "3219",
        "code": "ME2-009",
        "types": [
          "Conjuro",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Expulsión Divina",
        "effect": "Requerimiento: Controlar 3+ unidades 'Ángel'. Selecciona 1 unidad en el campo; Retornala.(Devuelve la carta específica a la mano de su dueño)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 15000
      },
      {
        "idd": "4004",
        "code": "ME2-010",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Llamado de Fe",
        "effect": "Selecciona 1 unidad en el campo; Si controlas 1+ unidades 'Ángel', retorna esa unidad. (Devuelve la carta específica a la mano de su dueño)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1000
      },
      {
        "idd": "4724",
        "code": "ME2-011",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Ángel Visionario",
        "effect": "Al Invocar: Roba 1 carta.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 800
      },
      {
        "idd": "4282",
        "code": "ME2,3-013",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Sudbury Basin",
        "effect": "Selecciona 1 unidad en el campo; Inflige 3 Daños a esa unidad.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          },
          {
            "code": "ME3",
            "name": "Mazo Espirítus - El Árbol de la Vida"
          }
        ],
        "price": 2000
      },
      {
        "idd": "5589",
        "code": "ME2-015",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Varvara",
        "effect": "Al jugar: Revela las 6 cartas del tope de tu mazo, agrega 1 'Ángel' de las cartas reveladas. Devuelve las demás cartas al fondo de tu mazo.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1600
      },
      {
        "idd": "8477",
        "code": "ME2-016",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Aleksandra",
        "effect": "Al jugar: puedes seleccionar 1 unidad en el campo; Inflige 2 Daños a esa unidad.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 2400
      },
      {
        "idd": "9236",
        "code": "ME2,3-018",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "4",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Avispa Enfurecida",
        "effect": "",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          },
          {
            "code": "ME3",
            "name": "Mazo Espirítus - El Árbol de la Vida"
          }
        ],
        "price": 400
      },
      {
        "idd": "6758",
        "code": "ME2-020",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "2",
        "defense": "2",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [
          "Sed De Sangre"
        ],
        "name": "Fenrir",
        "effect": "Sed De Sangre. (Todo el Daño que esta carta inflige, te cura)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 800
      },
      {
        "idd": "2922",
        "code": "ME2,3-019",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Latigazo a la Tropa",
        "effect": "Si hay 3+ unidades en el campo, selecciona 1; inflige 1 Daño a esa unidad.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          },
          {
            "code": "ME3",
            "name": "Mazo Espirítus - El Árbol de la Vida"
          }
        ],
        "price": 1600
      },
      {

        "idd": "6390",
        "code": "ME2-022",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Condena Celestial",
        "effect": "Selecciona 1 unidad en el campo; inflige 6 Daños a esa unidad.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1000
      },
      {
        "idd": "3415",
        "code": "ME2-024",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "3",
        "defense": "3",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [
          "Sed De Sangre"
        ],
        "name": "Aleksandra Coronada",
        "effect": "Al jugar, selecciona 1 unidad en el campo; inflige 2 Daños a esa unidad. Sed De Sangre. (Todo el Daño que esta carta inflige, te cura)",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 2500
      },
      {
        "idd": "6851",
        "code": "ME2-025",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "6",
        "force": "3",
        "defense": "2",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Zadkiel Misericordioso",
        "effect": "Todas tus unidades reciben +2/+1.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 800
      },
      {
        "idd": "4219",
        "code": "ME2-026",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Guardián de Apoyo",
        "effect": "Requerimiento: Este turno una unidad fue retornada desde el campo. Solo puedes controlar 1 'Guardián de Apoyo'.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 14000
      },
      {
        "idd": "6612",
        "code": "ME2-027",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Maná Ángel",
        "effect": "",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 1000
      },
      {
        "idd": "0435",
        "code": "ME3-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "2",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [
          "Defensor"
        ],
        "name": "Jerbo",
        "effect": "Si esta unidad es destruida en batalla, invoca una Ficha 'Espíritu' 0/0. Defensor.(No puede ser Atacante durante el Combate)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1400
      },
      {
        "idd": "6563",
        "code": "ME3-002",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Gema Efímera",
        "effect": "Si controlas 1+ unidades 'Espíritu'; Establece 1 de tus Maná pagado como Disponible.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1600
      },
      {
        "idd": "4137",
        "code": "ME3-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Espíritu",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Copito de Nieve",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1600
      },
      {
        "idd": "3613",
        "code": "ME3-004",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Furia de la Naturaleza",
        "effect": "Si controlas 1+ Ente; Destruye TODAS las unidades en el campo. No puedes activar esta carta durante el combate.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 2400
      },
      {
        "idd": "5414",
        "code": "ME3-005",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Recompensa del Creyente",
        "effect": "Si controlas 1+ Ente; Roba dos cartas.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 2200
      },
      {
        "idd": "1931",
        "code": "ME3-006",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Mapuche el Cauteloso",
        "effect": "",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 2200
      },
      {
        "idd": "8833",
        "code": "ME3-007",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Capa de Trascendencia",
        "effect": "Soy tratado como 'Espíritu'.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1000
      },
      {
        "idd": "5514",
        "code": "ME3-008",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Avance Espíritual",
        "effect": "Invoca 2 Fichas 'Espíritu' 0/0.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1400
      },
      {
        "idd": "5235",
        "code": "ME3-009",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Araña errante",
        "effect": "Al jugar, selecciona 1 unidad oponente; Duerme esa unidad. (No puede Atacar ni Bloquear hasta el final del turno)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1000
      },
      {
        "idd": "5298",
        "code": "ME3,4-010",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "2",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Cactus Pinchador",
        "effect": "Cuando me equipan un Arma, roba 1 carta. Solo puedes usar este efecto una vez por turno.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "7370",
        "code": "ME3-011",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Equipo de Luciérnagas",
        "effect": "Solo me pueden equipar a un 'Espíritu'. Cuando mi portador es destruido en batalla, retorna esta Arma.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 800
      },
      {
        "idd": "9043",
        "code": "ME3-014",
        "types": [
          "Ente",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Semilla, Arbol Magico",
        "effect": "Requerimiento: Controlar 1 'Espíritu'. Fase de Robo: Si no controlas la Ficha 'Espíritu del Bosque', Invoca una 0/1 'Espíritu del Bosque'.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 10000
      },
      {
        "idd": "5258",
        "code": "ME3-015",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [
          "Defensor"
        ],
        "name": "Pequeño Campus",
        "effect": "Cuando esta unidad es destruida en batalla, recibes un Maná pagado de tu mazo de Maná. Defensor. (No puede ser Atacante durante el Combate)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1600
      },
      {
        "idd": "3938",
        "code": "ME3-016",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Esporas Somníferas",
        "effect": "Selecciona hasta 2 unidades en el campo; Duerme esas unidades.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 2000
      },
      {
        "idd": "8610",
        "code": "ME3,4-017",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "4",
        "defense": "2",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [
          "Defensor"
        ],
        "name": "Oso Guardián",
        "effect": "Defensor. (No puede ser Atacante durante el Combate)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "3370",
        "code": "ME3,4-020",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "4",
        "defense": "3",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Ebrio del Bosque",
        "effect": "",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          },
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "2685",
        "code": "ME3-021",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "5",
        "defense": "4",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [
          "Defensor"
        ],
        "name": "Cuidador del Bosque",
        "effect": "Rápido: Puedes devolver 1 Maná a tu mazo de Maná; para negar mis efectos por este turno. Defensor. (No puede ser Atacante durante el Combate)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1000
      },
      {
        "idd": "6438",
        "code": "ME3-022",
        "types": [
          "Ente",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "3",
        "force": "6",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Arbol Mágico",
        "effect": "Solo me puedes invocar sobre 'Semilla, Árbol Mágico' y recibo sus efectos. Tus Fichas Espíritu reciben +2/+0.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 6000
      },
      {
        "idd": "4416",
        "code": "ME3-024",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "6",
        "defense": "4",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Lobo gigante",
        "effect": "",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 400
      },
      {
        "idd": "9620",
        "code": "ME3-025",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "3",
        "defense": "3",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [
          "Sed De Sangre"
        ],
        "name": "Dionaea Matamoscas",
        "effect": "Rápido: Selecciona 1 'Espíritu' que controles y otra unidad en el campo; Destruye el 'Espíritu' para Infligir 2 daños a esa unidad. Sed De Sangre. (Todo el Daño que esta carta inflige, te cura)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1600
      },
      {
        "idd": "3909",
        "code": "ME3-026",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "6",
        "force": "4",
        "defense": "3",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Mistress Espíritual",
        "effect": "Al jugar: Duermo todas las unidades oponentes.",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 600
      },
      {
        "idd": "3221",
        "code": "ME3-027",
        "types": [
          "Ficha"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Espíritu del Bosque",
        "effect": "",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1000
      },
      {
        "idd": "7222",
        "code": "ME3-028",
        "types": [
          "Ficha"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Espíritu",
        "effect": "",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1200
      },
      {
        "idd": "6613",
        "code": "ME3-029",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Maná Espíritu",
        "effect": "",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 1200
      },
      {
        "idd": "0101",
        "code": "ME4-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Shadu el Aprendiz",
        "effect": "Recibo +1/+2 mientras esté equipado.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 800
      },
      {
        "idd": "4912",
        "code": "ME4-002",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "-2",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Cuchillo de papel",
        "effect": "",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1800
      },
      {
        "idd": "4056",
        "code": "ME4-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Hachiko",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1600
      },
      {
        "idd": "5316",
        "code": "ME4-004",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Implicación cuántica",
        "effect": "Selecciona 1 unidad en el campo; Si está equipada, destrúyela.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 2000
      },
      {
        "idd": "2352",
        "code": "ME4-005",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Lo Deje Por Aquí!",
        "effect": "Descarta 1 carta de tu mano al cementerio y selecciona 1 Arma en el Cementerio; Retorna esa Arma.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "8654",
        "code": "ME4-006",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "2",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Vigilante Dormido",
        "effect": "",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "3981",
        "code": "ME4-007",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Manzana del Pecado",
        "effect": "Soy tratado como 'Humano'.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1000
      },
      {
        "idd": "2476",
        "code": "ME4-009",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Kasuga",
        "effect": "Soy tratado como 'Rashomon'. (Las unidades 'Rashomon' no puede Atacar o Bloquear)",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 2500
      },
      {
        "idd": "9304",
        "code": "ME4-014",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Chaleco Bomba",
        "effect": "Solo me pueden equipar a un 'Humano'. Fase de Robo: Destruye Todas las unidades en el campo.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1200
      },
      {
        "idd": "7421",
        "code": "ME4-011",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "2",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Herrero Mecánico",
        "effect": "Tus unidades Equipadas reciben +1/+0.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "1339",
        "code": "ME3,4-012",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "1",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Escudo de Plasma",
        "effect": "Al Equipar selecciona una unidad en el campo e inflige 2 Daños a esa unidad.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          },
          {
            "code": "ME3",
            "name": "Mazo Espirítus - El Árbol de la Vida"
          }
        ],
        "price": 1400
      },
      {
        "idd": "4949",
        "code": "ME4-015",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Betty Reid",
        "effect": "Al jugar: Revela 6 cartas del tope de tu mazo, agrega 1 Arma o 'Humano' de las cartas reveladas. Devuelve las demás cartas al fondo de tu mazo.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1600
      },
      {
        "idd": "4027",
        "code": "ME4-016",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Equipo básico SE-03",
        "effect": "Solo me pueden equipar a un 'Humano'.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 400
      },
      {
        "idd": "8971",
        "code": "ME4-021",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "1",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Ariete",
        "effect": "Mi costo se reduce en 1 por cada 'Humano' que controles. Puedes descartar 1 Arma de tu mano; Retorna esta carta desde el cementerio.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 2400
      },
      {
        "idd": "1331",
        "code": "ME4-024",
        "types": [
          "Arma",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "5",
        "force": "1",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [
          "Destrozar"
        ],
        "name": "Mark Ex-303",
        "effect": "Al Equipar, selecciona 1 unidad en el campo e infligele 3 Daños a esa unidad. Está Arma no puede ser reemplazada, si se pago su coste. Destrozar(Si esta unidad Ataca, inflije el excedente de fuerza a las vidas del oponente)",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 16000
      },
      {
        "idd": "5419",
        "code": "ME4-025",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "3",
        "defense": "3",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Sadhu Armormaster",
        "effect": "Al Jugar: Revela 6 cartas del tope de tu mazo, equipa cartas de Arma reveladas que quieras a unidades en el campo. Devuelve las demás cartas al mazo y barajalo.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1000
      },
      {
        "idd": "5823",
        "code": "ME4-026",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "3",
        "defense": "3",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Excavador Alemán",
        "effect": "Al Jugar: Equipame 1 Arma del cementerio, mano, mazo o Limbo sin pagar su coste.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1200
      },
      {
        "idd": "2830",
        "code": "ME4-027",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "3",
        "defense": "2",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [
          "Sed De Sangre"
        ],
        "name": "Barachiel",
        "effect": "Requerimiento: Destruye 2 Armas equipadas a tus unidades. Fase Final: Puedes agregar 1 Arma de tu mazo a tu mano. Solo puedes controlar 1 'Barachiel'. Sed De Sangre.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 14000
      },
      {
        "idd": "6614",
        "code": "ME4-028",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Maná Humano",
        "effect": "",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 1400
      },
      {
        "idd": "7637",
        "code": "MD1-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Jennika",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta)",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "6180",
        "code": "MD1-002",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "2",
        "archetypes": [
          "Rashomon"
        ],
        "keywords": [
          "Rashomon"
        ],
        "name": "Puerta Gélida",
        "effect": "Fase de Robo: Selecciona 1 unidad en el campo; Recibe +0/-1 este turno. (Las unidades 'Rashomon' no puede Atacar o Bloquear)",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "6719",
        "code": "MD1-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "6",
        "force": "8",
        "defense": "5",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Koshe el Campeon",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "7357",
        "code": "MD1-004",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "2",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Bruja Invocadora",
        "effect": "Al Jugar: Invoca 2 fichas 'Demonio' 0/0.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 500
      },
      {
        "idd": "8104",
        "code": "MD1-005",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "3",
        "defense": "3",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Laion Semi-Dios",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 200
      },
      {
        "idd": "3764",
        "code": "MD1-006",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Vidente del Caos",
        "effect": "Fase de Robo: Puedes destruirme para que la siguiente carta que juegues este turno, cueste 1 menos.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 400
      },
      {
        "idd": "3550",
        "code": "MD1-007",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Tendera de Municiones",
        "effect": "Al Invocar: Puedes agregar 1 Arma coste 1 de tu mazo.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 400
      },
      {
        "idd": "7223",
        "code": "MD1-008",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [
          ""
        ],
        "name": "Búho Nocturno",
        "effect": "Turnopp: Recibo +2/+1. (Se obtiene el efecto si se juega en el turno oponente)",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "7582",
        "code": "MD1-009",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Segunda Pitonisa",
        "effect": "Al invocar: Mira las 3 cartas del tope de tu mazo, regresalas en cualquier orden al tope del mazo.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "3343",
        "code": "MD1-010",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Diablillo Reclutador",
        "effect": "Al invocar: Puedes agregar 1 unidad Coste 0 de tu mazo.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 400
      },
      {
        "idd": "5635",
        "code": "MD1-011",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Peluche Triste",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 600
      },
      {
        "idd": "5418",
        "code": "MD1-012",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "4",
        "defense": "3",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Hok el Oculto",
        "effect": "Al Jugar: Selecciona 1 unidad oponente; Duermela. (No puede Atacar ni Bloquear hasta el final del turno)",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "7707",
        "code": "MD1-013",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "1",
        "defense": "2",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Tzelathiel el Autonomo",
        "effect": "Al Jugar: Selecciona 1 unidad en el campo; Retornala (Devuelve la carta específica a la mano de su dueño)",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 200
      },
      {
        "idd": "3057",
        "code": "MD1-014",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Municion 7.0",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "3837",
        "code": "MD1-015",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Hacha de Fuego",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "2131",
        "code": "MD1-016",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Disparo Lateral",
        "effect": "Selecciona 1 unidad en el campo y descarta un Arma; inflige la fuerza del Arma como Daño a esa unidad.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 200
      },
      {
        "idd": "8144",
        "code": "MD1-017",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Rompe Muros",
        "effect": "Selecciona 1 unidad Bloqueadora; inflige 2 Daños a esa unidad.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "0537",
        "code": "MD1-018",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Nictofobia",
        "effect": "Selecciona 1 unidad en el campo; Establece su defensa en 0 este turno.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 400
      },
      {
        "idd": "9645",
        "code": "MD1-019",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Asistencia Militar",
        "effect": "Selecciona 1 unidad y 1 Arma en tu cementerio; Retornalos.(Devuelve las cartas específicas a la mano de su dueño)",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "1589",
        "code": "MD1-020",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Selección Divina",
        "effect": "Cada jugador destruye unidades que controle hasta tener Maximo 2.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 100
      },
      {
        "idd": "9340",
        "code": "MD1-021",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Alíen"
        ],
        "keywords": [""],
        "name": "Devora Cobardes",
        "effect": "Requerimiento: Sacrifica cualquier cantidad de tus unidades, minimo 1. Recibo +1/+1 por cada unidad sacrificada.",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 600
      },
      {
        "idd": "0066",
        "code": "MD1-022",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Alma",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 200
      },
      {
        "idd": "0067",
        "code": "MD1-023",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Alma",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 600
      },
      {
        "idd": "0068",
        "code": "MD1-024",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Alma",
        "effect": "",
        "products": [
          {
            "code": "MD1",
            "name": "Mazo De Demostración - Primer Estallido"
          }
        ],
        "price": 200
      },
      {
        "idd": "8477",
        "code": "P-004",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "3",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Aleksandra",
        "effect": "Al jugar: puedes seleccionar 1 unidad en el campo; Inflige 2 Daños a esa unidad.",
        "products": [
          {
            "code": "ME2",
            "name": "Mazo Angeles - Amanecer Celestial"
          }
        ],
        "price": 46000
      },
      {
        "idd": "0006",
        "code": "P-001",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "6",
        "defense": "4",
        "archetypes": [""],
        "keywords": [
          "Destrozar"
        ],
        "name": "Prime Wenddygo",
        "effect": "Requerimiento: Sacrifica 3+ unidades con un total de 4+ Arquetipos. Destrozar. (Si esta unidad Ataca, inflige el excedente de fuerzaa las vidas del oponente)",
        "products": [
          {
            "code": "PGC",
            "name": "Promo Torneo Lanzamiento"
          }
        ],
        "price": 20000
      },
      {
        "idd": "9340",
        "code": "P-003",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Alíen"
        ],
        "keywords": [""],
        "name": "Devora Cobardes",
        "effect": "Requerimiento: Sacrifica cualquier cantidad de tus unidades, minimo 1. Recibo +1/+1 por cada unidad sacrificada.",
        "products": [
          {
            "code": "PGC",
            "name": "Promo Torneo"
          }
        ],
        "price": 24000
      },
      {
        "idd": "4137",
        "code": "P-005",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Espíritu",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Copito de Nieve",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "ME3",
            "name": "Mazo Espíritus - El Árbol de la Vida"
          }
        ],
        "price": 32000
      },
      {
        "idd": "8971",
        "code": "P-010",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "3",
        "force": "1",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Ariete",
        "effect": "Mi costo se reduce en 1 por cada 'Humano' que controles. Puedes descartar 1 Arma de tu mano; Retorna esta carta desde el cementerio.",
        "products": [
          {
            "code": "ME4",
            "name": "Mazo Humanos - Depliegue de la Armada"
          }
        ],
        "price": 44000
      },
      {
        "idd": "0009",
        "code": "P-009",
        "types": [
          "Ficha"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Ángel",
        "effect": "",
        "products": [
          {
            "code": "PGC",
            "name": "Promo Torneo"
          }
        ],
        "price": 20000
      },
      {
        "idd": "0006",
        "code": "PC-001",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta Dorada"],
        "cost": "1",
        "force": "6",
        "defense": "4",
        "archetypes": [""],
        "keywords": [
          "Destrozar"
        ],
        "name": "Prime Wenddygo",
        "effect": "Requerimiento: Sacrifica 3+ unidades con un total de 4+ Arquetipos. Destrozar. (Si esta unidad Ataca, inflige el excedente de fuerzaa las vidas del oponente)",
        "products": [
          {
            "code": "PGCC",
            "name": "Promo Ganador Torneo Lanzamiento"
          }
        ],
        "price": 120000
      },
      {
        "idd": "7116",
        "code": "P-007",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "5",
        "force": "3",
        "defense": "2",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Bahamoot Aniquilador",
        "effect": "Al Jugar: Puedes destruir los demás 'Demonios' que controles, inflige 1 daño a las vidas del oponente por cada 'Demonio' destruido.",
        "products": [
          {
            "code": "ME1",
            "name": "Mazo Demonios - Arte de la Destrucción"
          }
        ],
        "price": 40000
      },
      {
        "idd": "1478",
        "code": "LP-005",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Hamaliel",
        "effect": "Requerimiento: Retorna 1 de tus unidades. Fase de robo: Recibo +1/+1.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 10000
      },
      {
        "idd": "1110",
        "code": "LP-002",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "5",
        "defense": "2",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "MiedOgro",
        "effect": "Reduce mi costo en 1 por cada \"Ogro\" en tu campo.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 800
      },
      {
        "idd": "1102",
        "code": "LP-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "RescatadOgro",
        "effect": "Cuando esta unidad es destruida en batalla, agrega 1 carta \"Ogro\" de tu mazo a tu mano.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 8000
      },
      {
        "idd": "1147",
        "code": "LP-003",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "EncuentrOgro",
        "effect": "Agrega 2 unidades \"Ogro\" de tu mazo a tu mano.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 2400
      },
      {
        "idd": "1473",
        "code": "LP-007",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Bendición empírea",
        "effect": "La siguiente Unidad \"Ángel\" que juegues desde la Mano este turno, cuesta 1 menos.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1400
      },
      {
        "idd": "1234",
        "code": "LP-009",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "3",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Guardaespaldas Jost",
        "effect": "Defensor. (No puede Atacar durante el combate)",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 3200
      },
      {
        "idd": "1279",
        "code": "LP-010",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "3",
        "force": "3",
        "defense": "2",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Armamentista Erik",
        "effect": "Al jugar, selecciona 2 Armas en tu cementerio; Retornalas.(Devuelve la carta especifica a la mano de su dueño)",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 12000
      },
      {
        "idd": "7415",
        "code": "LP-011",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "5",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Bola de demolición",
        "effect": "",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 800
      },
      {
        "idd": "6551",
        "code": "LP-014",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "1",
        "defense": "2",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Renkem",
        "effect": "Cuando esta unidad es destruida en batalla, invocala del cementerio.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1400
      },
      {
        "idd": "1396",
        "code": "LP-016",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Esencia efimera",
        "effect": "Selecciona 1 \"Espíritu del Bosque\" en tu campo; Destruyelo y otorga sus estadísticas a todas las unidades que controles en ese momento\nhasta el final del turno.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 7000
      },
      {
        "idd": "2247",
        "code": "LP-021",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Collar de puas",
        "effect": "Solo me pueden equipar a una \"Mascota\". Mientras me bloquean obtengo +3/+0",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1400
      },
      {
        "idd": "2223",
        "code": "LP-023",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Se Busca!",
        "effect": "Revela 6 cartas del tope de tu mazo, agrega las unidades \"Mascota\" reveladas.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1400
      },
      {
        "idd": "3358",
        "code": "LP-024",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Infestación",
        "effect": "Selecciona 1 unidad en el campo; Inflige 1 daño por cada unidad \"Mascota\" en el campo.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1600
      },
      {
        "idd": "7775",
        "code": "LP-027",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Ratikaze",
        "effect": "Cuando esta unidad es destruida en batalla, desintegra la unidad que la destruyo si controlas otra \"Mascota\". Atraer. ",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1400
      },
      {
        "idd": "0067",
        "code": "LP-032",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "",
        "effect": "",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 8000
      },
      {
        "idd": "0068",
        "code": "LP-033",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "",
        "effect": "",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 8000
      },
      {
        "idd": "3343",
        "code": "LP-035",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Diablillo Reclutador",
        "effect": "Al invocar: Puedes agregar 1 unidad Coste 0 de tu mazo.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 11000
      },
      {
        "idd": "7637",
        "code": "LP-037",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Mascota"
        ],
        "keywords": [""],
        "name": "Jennika",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta)",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 7000
      },
      {
        "idd": "5879",
        "code": "LP-012",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Cacería de los Humildes",
        "effect": "Agrega 2 cartas sin efecto de tu mazo a tu mano, 1 unidad \"Humano\" y 1 Arma.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1200
      },
      {
        "idd": "2296",
        "code": "LP-022",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "3",
        "force": "4",
        "defense": "3",
        "archetypes": [
          "Mascota"
        ],
        "keywords": [""],
        "name": "Ruidoso festivo",
        "effect": "Requerimiento: Controlar 3+ unidades \"Mascota\".",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 4000
      },
      {
        "idd": "7747",
        "code": "LP-026",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Maldición de Safira",
        "effect": "Puedes enviar cartas de tu mano al cementerio para reducir mi coste en 1 por cada carta. Selecciona 1 unidad en el campo; niega sus efectos y los efectos que estéactivando este turno.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 13000
      },
      {
        "idd": "6656",
        "code": "LP-028",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Sr. Gatolar",
        "effect": "Roba 1 carta por cada unidad con 2+ arquetipos que controles.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1400
      },
      {
        "idd": "2131",
        "code": "LP-038",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Disparo Lateral",
        "effect": "Selecciona 1 unidad en el campo y descarta un Arma; inflige la fuerza del Arma como Daño a esa unidad.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 5000
      },
      {
        "idd": "1457",
        "code": "LP-004",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "SueñOgro",
        "effect": "Al Invocar, Duermeme. (Las unidades dormidas no pueden Atacar ni Bloquear hasta el final del turno) ",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1200
      },
      {
        "idd": "1325",
        "code": "LP-008",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Redención Angelical",
        "effect": "Agrega 1 Unidad \"Ángel\" de tu mazo a tu mano.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 2000
      },
      {
        "idd": "4445",
        "code": "LP-017",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Rashomon"
        ],
        "keywords": [
          "Rashomon"
        ],
        "name": "Puerta Prohibida",
        "effect": "NINGÚN jugador puede jugar cartas por coste 0.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 2000
      },
      {
        "idd": "6874",
        "code": "LP-018",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Aplasta Insectos",
        "effect": "Selecciona 1 unidad con Fuerza 0 en el campo; Destruyela.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 4000
      },
      {
        "idd": "2253",
        "code": "LP-020",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "5",
        "force": "6",
        "defense": "0",
        "archetypes": [
          "Mascota"
        ],
        "keywords": [""],
        "name": "El \"Pura Sangre\"",
        "effect": "Reduce mi costo en 1 por cada \"Mascota\" en tu campo.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1600
      },
      {
        "idd": "6985",
        "code": "LP-025",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Atraepájaros ",
        "effect": "Al jugar: revela 6 cartas del tope de tu mazo, agrega 1 carta que mencioné \"Mascota\".",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 2400
      },
      {
        "idd": "1444",
        "code": "LP-029",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Salva Almas",
        "effect": "Selecciona 2 unidades en el campo; inflige 1 daño a cada una. Inflige 1 daño a tus vidas.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 4600
      },
      {
        "idd": "1555",
        "code": "LP-030",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "6",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Furiacus",
        "effect": "Reduce mi costo en 1 por cada \"Mascota\" en tu campo. Tus unidades reciben +3/+1 durante este turno.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1200
      },
      {
        "idd": "5635",
        "code": "LP-036",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "0",
        "defense": "1",
        "archetypes": [""],
        "keywords": [""],
        "name": "Peluche Triste",
        "effect": "",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 16000
      },
      {
        "idd": "3764",
        "code": "LP-039",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Vidente del Caos",
        "effect": "Fase de Robo: Puedes destruirme para que la siguiente carta que juegues este turno, cueste 1 menos.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 8000
      },
      {
        "idd": "1487",
        "code": "LP-006",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [""],
        "keywords": [""],
        "name": "Armadura reluciente",
        "effect": "Solo me pueden equipar a una \"Aleksandra\". Al equipar selecciona 1 unidad le inflijo 4 daños",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1600
      },
      {
        "idd": "4598",
        "code": "LP-013",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Manarluza",
        "effect": "Mientras controles 1+ Ente, la primera carta que juegues cada turno cuesta 1 menos.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 2000
      },
      {
        "idd": "4447",
        "code": "LP-015",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Espada Arbórea",
        "effect": "Si controlas un Ente \"Arbol\", recibo +2/0.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 1200
      },
      {
        "idd": "4457",
        "code": "LP-019",
        "types": [
          "Ente",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Camino Radiante",
        "effect": "La primera vez que SOLO 1 de tus unidades \"Mascota\" fuera a ser destruida, no lo es. La primera unidad \"Mascota\" que juegues cada turno cuesta 1 menos.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 6000
      },
      {
        "idd": "0006",
        "code": "LP-031",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "6",
        "defense": "4",
        "archetypes": [""],
        "keywords": [
          "Destrozar"
        ],
        "name": "Prime Wenddygo",
        "effect": "Requerimiento: Sacrifica 3+ unidades con un total de 4+ Arquetipos. Destrozar (Si esta unidad Ataca, inflige el excedente de fuerza a las vidas del oponente)",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 2000
      },
      {
        "idd": "3550",
        "code": "LP-034",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Tendera de Municiones",
        "effect": "Al Invocar: Puedes agregar 1 Arma coste 1 de tu mazo.",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 10000
      },
      {
        "idd": "7707",
        "code": "LP-040",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "4",
        "force": "1",
        "defense": "2",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Tzelathiel el Autonomo",
        "effect": "Al Jugar: Selecciona 1 unidad en el campo; Retornala (Devuelve la carta específica a la mano de su dueño)",
        "products": [
          {
            "code": "LP",
            "name": "Leyendas Peludas"
          }
        ],
        "price": 6000
      },
      {
        "idd": "8225",
        "code": "GNC-001",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "6",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Ofrenda Silente",
        "effect": "Selecciona una unidad que controles; destrúyela para infligir la mitad de su defensa a las vidas del oponente. (El daño se redondea hacia arriba)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 24000
      },
      {
        "idd": "6162",
        "code": "GNC-008",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Exilio Celestial",
        "effect": "Si controlas 1+ unidades \"Ángel\", selecciona 1 Ente en el campo; retorna ese Ente. (Devuelve esa carta a la mano de su dueño)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2600
      },
      {
        "idd": "0625",
        "code": "GNC-009",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Astas Crecientes",
        "effect": "Esta carta es tratada como \"Sátiro\".",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 600
      },
      {
        "idd": "9127",
        "code": "GNC-011",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "1",
        "defense": "2",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Cazador de Restos",
        "effect": "Al jugar: puedes enviar 1 Arma de tu mazo al cementerio y agregar a tu mano 1 Arma con el mismo nombre de tu mazo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 24000
      },
      {
        "idd": "5495",
        "code": "GNC-017",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Espíritu del Bosque",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1200
      },
      {
        "idd": "3667",
        "code": "GNC-020",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "4",
        "force": "4",
        "defense": "3",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Albael el Observador",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 4000
      },
      {
        "idd": "6497",
        "code": "GNC-023",
        "types": [
          "Conjuro",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Plegaria Cruzada",
        "effect": "Roba 2 cartas, luego envía 1 carta de tu mano al cementerio.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 12000
      },
      {
        "idd": "6307",
        "code": "GNC-024",
        "types": [
          "Ente",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Chronocharge",
        "effect": "Fase de robo: puedes destruir esta carta para infligir 2 daños a 1 unidad en el campo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 6000
      },
      {
        "idd": "0125",
        "code": "GNC-031",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Gemelos de Sangre",
        "effect": "Selecciona 2 unidades que controles y 1 unidad oponente; destruye tus 2 unidades para destruir la unidad oponente.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1200
      },
      {
        "idd": "0174",
        "code": "GNC-034",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "4",
        "defense": "2",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Koshe",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1200
      },
      {
        "idd": "0876",
        "code": "GNC-035",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "7",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Ren Viento Silencioso",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 600
      },
      {
        "idd": "4741",
        "code": "GNC-039",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "4",
        "archetypes": [""],
        "keywords": [""],
        "name": "Ampiron ",
        "effect": "Fase de robo: inflige 3 daños a esta carta.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2400
      },
      {
        "idd": "6200",
        "code": "GNC-042",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "6",
        "force": "3",
        "defense": "3",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Summoros ",
        "effect": "Al jugar: puedes invocar hasta 3 Fichas \"Demonio\" 1/0.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1200
      },
      {
        "idd": "5687",
        "code": "GNC-043",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "4",
        "force": "2",
        "defense": "2",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Daemoncaller",
        "effect": "Si esta carta es destruida en el campo, invoca 1 unidad \"Demonio\" de tu mazo con fuerza 2 o menos.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 10000
      },
      {
        "idd": "1805",
        "code": "GNC-054",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Aprendiz Lil",
        "effect": "Al jugar: revela las 6 cartas del tope de tu mazo, agrega 1 Arma de las cartas reveladas, devuelve el resto al fondo del mazo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 3200
      },
      {
        "idd": "1477",
        "code": "GNC-064",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Último Lamento",
        "effect": "Selecciona 1 \"Sátiro\" que controles y 1 Ente en el campo; destruye el \"Sátiro\" para destruir el Ente.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 3000
      },
      {
        "idd": "0324",
        "code": "GNC-066",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "5",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Choque Devastador",
        "effect": "Selecciona 2 unidades que controles excepto cartas Ficha y 2 unidades oponentes; destrúyelas.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2000
      },
      {
        "idd": "4422",
        "code": "GNC-068",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 16000
      },
      {
        "idd": "2415",
        "code": "GNC-002",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "5",
        "force": "4",
        "defense": "2",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Druanor",
        "effect": "Al jugar: puedes invocar hasta 2 Fichas \"Espíritu del Bosque\" 2/1.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 3600
      },
      {
        "idd": "5963",
        "code": "GNC-007",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "VengadOgro",
        "effect": "El costo de esta carta se reduce en 1 por cada \"Demonio\" destruido este turno.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 28000
      },
      {
        "idd": "2660",
        "code": "GNC-015",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Cuchilla Oscura",
        "effect": "Al equipar esta Arma la unidad portadora recibe 1 daño.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 4800
      },
      {
        "idd": "5531",
        "code": "GNC-019",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "2",
        "archetypes": [""],
        "keywords": [""],
        "name": "Rotot Guard",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 600
      },
      {
        "idd": "8122",
        "code": "GNC-028",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Primera Pitonisa",
        "effect": "Al jugar: puedes invocar \"Segunda Pitonisa\" de tu mazo a tu campo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 3000
      },
      {
        "idd": "3621",
        "code": "GNC-046",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [
          "Sed De Sangre"
        ],
        "name": "Tributo al Soberano",
        "effect": "Selecciona 1 \"Demonio\" que controles; inflige 3 daños a esa unidad. Sed De Sangre. (Todo el daño que esta carta inflige, te cura)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1400
      },
      {
        "idd": "7522",
        "code": "GNC-048",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Sacrificio IIK",
        "effect": "Selecciona 1 unidad que controles; sacrifica esa unidad para invocar una Ficha \"Alíen\" 3/2.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1600
      },
      {
        "idd": "1238",
        "code": "GNC-050",
        "types": [
          "Ente",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Arsenal Nexus",
        "effect": "Fase de robo: Puedes agregar 1 Arma de tu mazo a la mano. Tus cartas Arma cuestan 1 menos.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 3200
      },
      {
        "idd": "0037",
        "code": "GNC-058",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel",
          "Humano"
        ],
        "keywords": [""],
        "name": "Forjador Hamaliel",
        "effect": "Requerimiento: retorna 1 carta Arma equipada a 1 unidad que controles. Cada vez que equipes 1 Arma a 1 unidad en el campo, recibo +1/+1.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1400
      },
      {
        "idd": "3574",
        "code": "GNC-060",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Refugio del Alma",
        "effect": "Fase final: puedes pagar 1 Alma y destruir esta carta para poner un Alma de tu mazo de Almas como disponible.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1400
      },
      {
        "idd": "0195",
        "code": "GNC-073",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Llama Caída",
        "effect": "Selecciona 1 unidad en el campo que sus estadísticas sumen 5; destrúyela.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 15000
      },
      {
        "idd": "1805",
        "code": "GNC-074",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Aprendiz Lil",
        "effect": "Al jugar: revela las 6 cartas del tope de tu mazo, agrega 1 Arma de las cartas reveladas, devuelve el resto al fondo del mazo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 26000
      },
      {
        "idd": "0060",
        "code": "GNC-077",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Pastel Podrido",
        "effect": "Selecciona 1 unidad en el campo; inflige 1 Daño a esa unidad.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 14000
      },
      {
        "idd": "6709",
        "code": "GNC-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "6",
        "force": "3",
        "defense": "4",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Zarekh",
        "effect": "Al jugar puedes seleccionar unidades en el campo igual al número de unidades \"Ángel\" que controles; retorna esas cartas. (Devuelve esas cartas a la mano de su dueño)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 10000
      },
      {
        "idd": "5989",
        "code": "GNC-004",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "0",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Alíen",
          "Mascota"
        ],
        "keywords": [""],
        "name": "Pulpiv",
        "effect": "Requerimiento: sacrifica 1 de tus unidades. Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2400
      },
      {
        "idd": "0300",
        "code": "GNC-005",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "4",
        "force": "2",
        "defense": "3",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Eliathor",
        "effect": "Tus unidades \"Ángel\" cuestan 1 menos. Al jugar: puedes agregar 1 \"Bendición empírea\" de tu mazo a tu mano.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 20000
      },
      {
        "idd": "6448",
        "code": "GNC-010",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "6",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "HelixReplicator V.1",
        "effect": "Solo puede equiparse a un \"Humano\". Al equipar, destruye esta Arma, invoca 1 \"Humano\" sin efecto de tu mazo, luego equípale 1 Arma desde el mazo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 18000
      },
      {
        "idd": "8118",
        "code": "GNC-014",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Lazo del Olvido",
        "effect": "Esta carta no pertenece a ningún arquetipo. ",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 400
      },
      {
        "idd": "7099",
        "code": "GNC-018",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Zadkiel el héroe ",
        "effect": "Si retornas 1+ carta(s) del oponente pon 2 contadores en esta carta. Con 6+ contadores: puedes destruir esta carta para invocar 1 \"Zadkiel Misericordioso\" de tu mano, mazo o cementerio.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1000
      },
      {
        "idd": "2360",
        "code": "GNC-027",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "2",
        "defense": "2",
        "archetypes": [""],
        "keywords": [""],
        "name": "DiscarDron",
        "effect": "Al jugar si tu oponente tiene 7+ cartas en la mano: tu oponente envía 2 cartas al azar de su mano al cementerio.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2400
      },
      {
        "idd": "9122",
        "code": "GNC-029",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "4",
        "force": "4",
        "defense": "2",
        "archetypes": [
          "Sátiro"
        ],
        "keywords": [""],
        "name": "Mortyros ",
        "effect": "Al jugar selecciona hasta 2 cartas de Ente en tu cementerio; devuélvelas al mazo y baraja.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1600
      },
      {
        "idd": "7549",
        "code": "GNC-030",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [
          "Destrozar"
        ],
        "name": "Dustcrawler",
        "effect": "Solo puede equiparse desde la mano a un \"Humano\". Destrozar. (Si esta unidad Ataca, inflige el excedente de fuerza a las vidas del oponente)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1400
      },
      {
        "idd": "4786",
        "code": "GNC-032",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "3",
        "defense": "2",
        "archetypes": [""],
        "keywords": [""],
        "name": "Barón Meow",
        "effect": "Si esta carta es destruida en el campo, roba 3 cartas.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 800
      },
      {
        "idd": "5899",
        "code": "GNC-038",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "6",
        "defense": "3",
        "archetypes": [""],
        "keywords": [
          "Defensor"
        ],
        "name": "Golkar",
        "effect": "Defensor.  (No puede atacar)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 800
      },
      {
        "idd": "0136",
        "code": "GNC-040",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "2",
        "defense": "1",
        "archetypes": [""],
        "keywords": [""],
        "name": "Cinturón negro",
        "effect": "Solo puede equiparse a 1 unidad sin efecto.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1000
      },
      {
        "idd": "0658",
        "code": "GNC-041",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel",
          "Vampiro"
        ],
        "keywords": [
          "Sed De Sangre"
        ],
        "name": "Desangrador de Luz",
        "effect": "Sed De Sangre. (Todo el daño que esta carta inflige, te cura)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1000
      },
      {
        "idd": "0090",
        "code": "GNC-047",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Mano del Avaro",
        "effect": "Selecciona 1 \"Demonio\" que controles; destrúyelo para robar 2 cartas.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1600
      },
      {
        "idd": "6452",
        "code": "GNC-049",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "6",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Caricia del Abismo",
        "effect": "Inflige 2 daños a las vidas de tu oponente.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 28000
      },
      {
        "idd": "7482",
        "code": "GNC-052",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "4",
        "defense": "4",
        "archetypes": [""],
        "keywords": [""],
        "name": "Tirano del cielo",
        "effect": "Solo puede equiparse si hay 4+ unidades \"Humano\" en el campo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1000
      },
      {
        "idd": "0844",
        "code": "GNC-056",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "10",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Cólera de Solarius",
        "effect": "Inflige daño a las vidas de tu oponente igual al costo que pagaste para jugar esta carta.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 8000
      },
      {
        "idd": "0630",
        "code": "GNC-059",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "3",
        "defense": "4",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Eryx Kaler",
        "effect": "Requerimiento: desintegra 3 cartas Arma de tu cementerio. (Las cartas desintegradas son enviadas boca abajo al Halo)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 17000
      },
      {
        "idd": "6487",
        "code": "GNC-062",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Aleksandra Alelo",
        "effect": "Al jugar puedes enviar 1 carta de tu mano al cementerio; agrega 1 carta que mencione \"Aleksandra\" de tu mazo a tu mano.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 36000
      },
      {
        "idd": "1563",
        "code": "GNC-063",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "6",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Destello de Solarius",
        "effect": "Selecciona 1 carta en el campo; desintegra esa carta y roba 1 carta. (Las cartas desintegradas son enviadas boca abajo al Halo)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2400
      },
      {
        "idd": "1002",
        "code": "GNC-065",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Angeli, Apoyo Divino",
        "effect": "Mientras esta carta este en la zona de combate, tus unidades \"Ángel\" reciben +1/+0.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 800
      },
      {
        "idd": "0968",
        "code": "GNC-067",
        "types": [
          "Ficha"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "3",
        "defense": "2",
        "archetypes": [
          "Alíen"
        ],
        "keywords": [""],
        "name": "Marix",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 6000
      },
      {
        "idd": "2415",
        "code": "GNC-069",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "5",
        "force": "4",
        "defense": "2",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Druanor",
        "effect": "Al jugar: puedes invocar hasta 2 Fichas \"Espíritu del Bosque\" 2/1.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 26000
      },
      {
        "idd": "5989",
        "code": "GNC-070",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "0",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Alíen",
          "Mascota"
        ],
        "keywords": [""],
        "name": "Pulpiv",
        "effect": "Requerimiento: sacrifica 1 de tus unidades. Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 18000
      },
      {
        "idd": "6452",
        "code": "GNC-076",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Secreta Dorada"],
        "cost": "6",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Caricia del Abismo",
        "effect": "Inflige 2 daños a las vidas de tu oponente.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 44000
      },
      {
        "idd": "7418",
        "code": "GNC-006",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Sátiro",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Faelix",
        "effect": "Mientras controles otra \"Mascota\" esta carta recibe Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2600
      },
      {
        "idd": "2940",
        "code": "GNC-012",
        "types": [
          "Arma",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Ethereal Gate",
        "effect": "Requerimiento: controlar solo unidades \"Humano\". Al equipar esta carta, puedes agregar 1 unidad \"Humano\" de tu mazo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 3200
      },
      {
        "idd": "0777",
        "code": "GNC-013",
        "types": [
          "Ente",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "7",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Castillo de la Nulidad",
        "effect": "Reduce el costo de esta carta en 1+ por desintegrar 1+ carta(s) de tu Limbo. Tus unidades sin efecto cuestan 1 menos. No puede ser objetivo de cartas.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 26000
      },
      {
        "idd": "0445",
        "code": "GNC-016",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "2",
        "archetypes": [""],
        "keywords": [""],
        "name": "Modelo Base",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 600
      },
      {
        "idd": "5832",
        "code": "GNC-021",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Marcas vacías  ",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 400
      },
      {
        "idd": "4418",
        "code": "GNC-022",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "2",
        "archetypes": [""],
        "keywords": [""],
        "name": "Drakitten",
        "effect": "",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1000
      },
      {
        "idd": "8159",
        "code": "GNC-025",
        "types": [
          "Ente",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "4",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Árbol Ancestral",
        "effect": "Requerimiento: sacrifica 1 Ente \"Árbol\" costo 3 que controles. No puede ser objetivo de cartas. Fase de robo: invoca 1 Ficha \"Espíritu del Bosque\"  2/1. Tus Fichas \"Espíritu\" reciben +2/+1.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 28000
      },
      {
        "idd": "0195",
        "code": "GNC-026",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Llama Caída",
        "effect": "Selecciona 1 unidad en el campo que sus estadísticas sumen 5; destrúyela.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 3400
      },
      {
        "idd": "6769",
        "code": "GNC-033",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "2",
        "defense": "1",
        "archetypes": [""],
        "keywords": [""],
        "name": "Sir Whiskersworth",
        "effect": "Si esta carta es destruida en el campo, roba 1 carta.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1600
      },
      {
        "idd": "5874",
        "code": "GNC-036",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "*",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Profanarius",
        "effect": "El costo de esta carta es igual al número de cartas en tu Limbo. Roba 2 cartas.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 28000
      },
      {
        "idd": "3624",
        "code": "GNC-037",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "3",
        "defense": "2",
        "archetypes": [""],
        "keywords": [""],
        "name": "Umbrawaith",
        "effect": "Al jugar: establece en 0 la defensa de las demás unidades en el campo hasta el final del turno.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1600
      },
      {
        "idd": "6547",
        "code": "GNC-044",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Guerrero Caído",
        "effect": "Selecciona 1 unidad en el campo; si su fuerza es 2 o menos, destrúyela.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 9000
      },
      {
        "idd": "9852",
        "code": "GNC-045",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Rara"],
        "cost": "4",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Pilar del Renacer",
        "effect": "Puedes seleccionar 1 unidad en cualquier cementerio; destruye esta carta para invocar esa unidad.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2000
      },
      {
        "idd": "7463",
        "code": "GNC-051",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Avernus Sanctum",
        "effect": "Si 1+ de tus unidades \"Demonio\" son destruidas, recuperas 1 vida.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 800
      },
      {
        "idd": "4111",
        "code": "GNC-053",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Coor Nil",
        "effect": "Al jugar: revela las 3 cartas del tope de tu mazo, agrega 1 \"Humano\" de las cartas reveladas, devuelve el resto al fondo del mazo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 2400
      },
      {
        "idd": "0214",
        "code": "GNC-055",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Ruptura Espacial",
        "effect": "Selecciona 1 unidad en el campo con estadísticas 0/0; desintegra esa carta. (Las cartas desintegradas son enviadas boca abajo al Halo)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1400
      },
      {
        "idd": "0657",
        "code": "GNC-057",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Eco de Tres",
        "effect": "Fase de robo: puedes robar 1 carta. Si robaste 3 cartas por este efecto, destruye esta carta.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1000
      },
      {
        "idd": "9682",
        "code": "GNC-061",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [""],
        "name": "Hypnosar ",
        "effect": "Fase de robo: puedes dormir esta unidad y 1 unidad oponente. (Las unidades dormidas no pueden atacar o bloquear hasta el final del turno)",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 1000
      },
      {
        "idd": "2940",
        "code": "GNC-071",
        "types": [
          "Arma",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Ethereal Gate",
        "effect": "Requerimiento: controlar solo unidades \"Humano\". Al equipar esta carta, puedes agregar 1 unidad \"Humano\" de tu mazo.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 25000
      },
      {
        "idd": "2660",
        "code": "GNC-072",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "1",
        "force": "1",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Cuchilla Oscura",
        "effect": "Al equipar esta Arma la unidad portadora recibe 1 daño.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 28000
      },
      {
        "idd": "6487",
        "code": "GNC-075",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Secreta Dorada"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Aleksandra Alelo",
        "effect": "Al jugar puedes enviar 1 carta de tu mano al cementerio; agrega 1 carta que mencione \"Aleksandra\" de tu mazo a tu mano.",
        "products": [
          {
            "code": "GNC",
            "name": "Génesis del Caos"
          }
        ],
        "price": 68000
      },
      {
        "idd": "0009",
        "code": "SMC01-026",
        "types": [
          "Ficha"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "0",
        "force": "1",
        "defense": "0",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [""],
        "name": "Demi",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 25000
      },
      {
        "idd": "8104",
        "code": "SMC01-002",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "3",
        "force": "3",
        "defense": "3",
        "archetypes": [""],
        "keywords": [""],
        "name": "Laion Semi-Dios",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "8833",
        "code": "SMC01-017",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Capa de Trascendencia",
        "effect": "Soy tratado como \"Espíritu\".",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "2899",
        "code": "SMC01-016",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Posesión Demoníaca",
        "effect": "Soy tratado como \"Demonio\".",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "6612",
        "code": "SMC01-007",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alma Ángel",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "6611",
        "code": "SMC01-008",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alma Demonio",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "1331",
        "code": "SMC01-025",
        "types": [
          "Arma",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta Dorada"],
        "cost": "5",
        "force": "1",
        "defense": "2",
        "archetypes": [""],
        "keywords": [
          "Destrozar"
        ],
        "name": "Mark Ex-303",
        "effect": "Al Equipar, selecciona 1 unidad en el campo e infligele 3 Daños a esa unidad. Está Arma no puede ser reemplazada, si se pago su coste.Destrozar(Si esta unidad Ataca, inflije el excedente de fuerza a las vidas del oponente)",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 70000
      },
      {
        "idd": "3221",
        "code": "SMC01-011",
        "types": [
          "Ficha"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "0",
        "force": "2",
        "defense": "1",
        "archetypes": [""],
        "keywords": [""],
        "name": "Espíritu del Bosque",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 30000
      },
      {
        "idd": "6618",
        "code": "SMC01-020",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "0",
        "force": "5",
        "defense": "3",
        "archetypes": [
          "Sátiro"
        ],
        "keywords": [
          "Destrozar"
        ],
        "name": "Mammon",
        "effect": "Requerimiento: Controlar 5 unidades  \"Demonio\". Destrozar.(Si esta unidad ataca, inflige el excedente de fuerza a las vidas del oponente)",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 20000
      },
      {
        "idd": "6719",
        "code": "SMC01-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "6",
        "force": "8",
        "defense": "5",
        "archetypes": [
          "Humano"
        ],
        "keywords": [""],
        "name": "Koshe el Campeon",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 12000
      },
      {
        "idd": "5560",
        "code": "SMC01-012",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Ángel",
          "Mascota"
        ],
        "keywords": [""],
        "name": "Ginger",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 12000
      },
      {
        "idd": "4056",
        "code": "SMC01-014",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Humano",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Hachikō",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 12000
      },
      {
        "idd": "3981",
        "code": "SMC01-019",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Manzana del Pecado",
        "effect": "Soy tratado como \"Humano\".",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "0067",
        "code": "SMC01-005",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alma Humano",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "0068",
        "code": "SMC01-006",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alma  Demonio",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "6613",
        "code": "SMC01-009",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alma  Espíritu",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "4912",
        "code": "SMC01-018",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "-2",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Cuchillo de papel",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "0066",
        "code": "SMC01-004",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alma Ente",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "6614",
        "code": "SMC01-010",
        "types": [
          "Alma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alma  Betty",
        "effect": "",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "5414",
        "code": "SMC01-021",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Recompensa del Creyente",
        "effect": "Si controlas 1+ Ente; Roba dos cartas.",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 18000
      },
      {
        "idd": "9078",
        "code": "SMC01-023",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Grieta Infernal",
        "effect": "Invoca hasta 2 Fichas \"Demonio\"  1/0.",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 12000
      },
      {
        "idd": "5514",
        "code": "SMC01-024",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Avance Espíritual",
        "effect": "Invoca 2 Fichas \"Espíritu\" 0/0.",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 12000
      },
      {
        "idd": "7582",
        "code": "SMC01-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "1",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [""],
        "name": "Segunda Pitonisa",
        "effect": "Al invocar: Mira las 3 cartas del tope de tu mazo, regresalas en cualquier orden al tope del mazo.",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 15000
      },
      {
        "idd": "8377",
        "code": "SMC01-013",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Demonio",
          "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "Bakeneko",
        "effect": "Atraer. (Al atacar puedes seleccionar la unidad bloqueadora de esta carta.)",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 12000
      },
      {
        "idd": "0152",
        "code": "SMC01-015",
        "types": [
          "Arma"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "0",
        "force": "0",
        "defense": "0",
        "archetypes": [""],
        "keywords": [""],
        "name": "Alas Sagradas",
        "effect": "Soy tratado como \"Ángel\".",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 8000
      },
      {
        "idd": "5316",
        "code": "SMC01-022",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [""],
        "keywords": [""],
        "name": "Implicación cuántica",
        "effect": "Selecciona 1 unidad en el campo; Si está equipada, destrúyela.",
        "products": [
          {
            "code": "SMC01",
            "name": "Sobre Souls Masters Circuit"
          }
        ],
        "price": 15000
      },
      {
        "idd": "3720",
        "code": "P-008",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Secreta"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [""],
        "name": "Volviendo a Casa",
        "effect": "Selecciona 1 de tus unidades en el campo; Retornala. (Devuelve la carta específica a la mano de su dueño)",
        "products": [
          {
            "code": "PGC",
            "name": "Promo Torneo"
          }
        ],
        "price": 80000
      },
      {
        "idd": "9467",
        "code": "EDA-001",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          "Ángel"
        ],
        "keywords": [
          ""
        ],
        "name": "Discípulo de Zadkiel",
        "effect": "Al jugar: puedes agregar 1 \"Zadkiel el héroe\" de tu mazo a tu mano.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2600
      },
      {
        "idd": "3658",
        "code": "EDA-002",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "1",
        "force": "1",
        "defense": "2",
        "archetypes": [
          "Rashomon"
        ],
        "keywords": [
          ""
        ],
        "name": "Puerta del Avismo",
        "effect": "Niega los efectos de las cartas Ente en el campo. Fase de robo:envía 1 carta de tu mano al cementerio. (Las unidades Rashomon no pueden atacar ni defender).",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2600
      },
      {
        "idd": "5410",
        "code": "EDA-003",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "2",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "InesperaDron",
        "effect": "Al jugar: tu oponente roba 3 cartas, luego tu oponente envía 3 cartas al azar de su mano al cementerio.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2200
      },
      {
        "idd": "0141",
        "code": "EDA-004",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [
          "Espíritu"
        ],
        "keywords": [
          ""
        ],
        "name": "Espíritu Alfa",
        "effect": "Al invocar: puedes agregar 1 \"Esencia Efimera\" del mazo a la mano.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1600
      },
      {
        "idd": "0587",
        "code": "EDA-005",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "4",
        "force": "2",
        "defense": "3",
        "archetypes": [
          "Demonio", "Mascota"
        ],
        "keywords": [
          "Atraer"
        ],
        "name": "GusanOgro",
        "effect": "Al invocar, duerme esta carta. (Las unidades dormidas no pueden atacar o bloquear hasta el final del turno) Atraer.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1600
      },
      {
        "idd": "4996",
        "code": "EDA-006",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "5",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Portador de la llama",
        "effect": "Al jugar: puedes seleccionar 1 unidad que controles con 5+ de Fuerza y 1 unidad oponente; destruye tu unidad para destruir la unidad oponente.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1600
      },
      {
        "idd": "8422",
        "code": "EDA-007",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "3",
        "force": "3",
        "defense": "3",
        "archetypes": [
          "Rashomon"
        ],
        "keywords": [
          ""
        ],
        "name": "Paso de confusión",
        "effect": "Mientras esta carta este en el campo, las unidades oponentes reciben -1/+0. (Las unidades \"Rashomon\" no puede atacar o bloquear)",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1800
      },
      {
        "idd": "0647",
        "code": "EDA-008",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "3",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [
          "Defensor"
        ],
        "name": "Pollo Astronómico",
        "effect": "Defensor.(No puede atacar)",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2000
      },
      {
        "idd": "4645",
        "code": "EDA-009",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "1",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Leviatalma",
        "effect": "Tus cartas con coste original 7+ cuestan 1 menos.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2000
      },
      {
        "idd": "4474",
        "code": "EDA-010",
        "types": [
          "Unidad",
          "Limbo"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "",
        "force": "0",
        "defense": "0",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Tajomaru",
        "effect": "Requerimiento: controlar 1+ unidades \"Rashomon\". Tus unidades \"Rashomon\" pueden atacar y bloquear. Solo puedes invocar 1 \"Tajomaru\" por turno.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2600
      },
      {
        "idd": "6858",
        "code": "EDA-011",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Viento Ligero",
        "effect": "Selecciona 1 unidad en el campo con 0 de defensa; retorna esa unidad. (Devuelve esa carta a la mano de su dueño)",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2400
      },
      {
        "idd": "0564",
        "code": "EDA-012",
        "types": [
          "Ente"
        ],
        "limit": "",
        "rarity": ["Comun", "Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Escape del Abismo",
        "effect": "Al jugar: destruye esta carta para invocar 1 unidad 0/0 del mazo ignorando su \"Requerimiento\".",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 3000
      },
      {
        "idd": "5600",
        "code": "EDA-013",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "2",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Furia Ígnea",
        "effect": "Selecciona 1 unidad en el campo; si esta herida, destrúyela.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1600
      },
      {
        "idd": "0215",
        "code": "EDA-014",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Gota del Eterno",
        "effect": "Recupera 1 vida.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2400
      },
      {
        "idd": "6877",
        "code": "EDA-015",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "0",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Toque Restaurador",
        "effect": "Selecciona 1 unidad herida en el campo; cúrala por completo.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1400
      },
      {
        "idd": "8201",
        "code": "EDA-016",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "7",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Pasaje del Errante",
        "effect": "Devuelve las cartas de tu Halo a tu mazo y baraja.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1200
      },
      {
        "idd": "6971",
        "code": "EDA-017",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun"],
        "cost": "1",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Alianza del Codicioso",
        "effect": "Desintegra 1 Alma que controles; roba 2 cartas.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1600
      },
      {
        "idd": "8810",
        "code": "EDA-018",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun", "Ultra"],
        "cost": "1",
        "force": "0",
        "defense": "1",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Kaelen el Aspirante",
        "effect": "Al jugar: puedes agregar hasta 2 cartas Conjuro sin efecto de tu mazo a tu mano.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1600
      },
      {
        "idd": "8750",
        "code": "EDA-019",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun", "Ultra"],
        "cost": "3",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Experimento M4",
        "effect": "Desintegra 1 Arma, 1 Conjuro, 1 Ente y 1 Unidad en tu cementerio; invoca 2 Fichas Alíen 3/2.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2200
      },
      {
        "idd": "0323",
        "code": "EDA-020",
        "types": [
          "Conjuro"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "7",
        "force": "",
        "defense": "",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Impacto Omega",
        "effect": "Destruye las unidades oponentes.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 1600
      },
      {
        "idd": "1245",
        "code": "EDA-021",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "4",
        "force": "3",
        "defense": "3",
        "archetypes": [
          "Demonio"
        ],
        "keywords": [
          "Destrozar"
        ],
        "name": "I. Azatorh",
        "effect": "Puedes reducir el coste de esta carta en 1+ por desintegrar 1+ unidades \"Demonio\" de tu cementerio. Destrozar.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2600
      },
      {
        "idd": "6541",
        "code": "EDA-022",
        "types": [
          "Unidad"
        ],
        "limit": "",
        "rarity": ["Comun","Ultra"],
        "cost": "3",
        "force": "2",
        "defense": "2",
        "archetypes": [
          ""
        ],
        "keywords": [
          ""
        ],
        "name": "Rug inmortal",
        "effect": "Al jugar: puedes seleccionar 1 unidad en el campo con 1 de fuerza o menos; destrúyela.",
        "products": [
          {
            "code": "EDA",
            "name": "Ecos del Abismo"
          }
        ],
        "price": 2000
      }
    ]
}

export const storeData: StoresData = {
  stores: [{
    "name": "Hidden TCG Store",
    "address": "Cl. 52 #24-18",
    "city": "Bogotá",
    "country": "Colombia",
    "length": "",
    "latitude": "",
    "url": "", 
    "postalCode": "",
    "phone": "string",
  },
  {
    "name": "TCG Collectibles",
    "address": "Cra. 13a #127-8",
    "city": "Bogotá",
    "country": "Colombia",
    "length": "",
    "latitude": "",
    "url": "", 
    "postalCode": "",
    "phone": "string",
  },
  {
    "name": "CLOVER TCG STORE",
    "address": "Calle 14 # 69-78",
    "city": "Cali",
    "country": "Colombia",
    "length": "",
    "latitude": "",
    "url": "", 
    "postalCode": "",
    "phone": "string",
  },
  {
    "name": "Excelsior Hobby Center",
    "address": "Cra 66 # 49A-26 Local 301 Suramericana",
    "city": "Medellín",
    "country": "Colombia",
    "length": "",
    "latitude": "",
    "url": "", 
    "postalCode": "",
    "phone": "string",
  }]
}