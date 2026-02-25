export interface Route {
  name: string;
  path?: string;
  menu?: Route[];
}

export const Routes: Route[] = [
  {
    name: "Jugar",
    menu: [
      {
        path: "/como-jugar",
        name: "Aprender a jugar",
      },
      {
        path: "/preguntas-frecuentes",
        name: "Preguntas frecuentes",
      },
    ],
  },
  {
    path: "/noticias",
    name: "Noticias",
  },
  {
    name: "Cartas",
    menu: [
      {
        path: "/cartas",
        name: "Explorar cartas",
      },
      {
        path: "/boveda",
        name: "Precios de las cartas",
      },
    ],
  },
  {
    name: "Mazos",
    menu: [
      {
        path: "/mazos",
        name: "Explorar mazos",
      },
      {
        path: "/laboratorio",
        name: "Creación de mazos",
      },
    ],
  },
  {
    path: "/torneos",
    name: "Torneos",
  },
  {
    name: "Productos",
    menu: [
      {
        path: "/productos",
        name: "Productos",
      },
      {
        path: "/tiendas",
        name: "Tiendas",
      },
    ],
  },
];
