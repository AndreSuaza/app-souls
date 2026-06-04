export interface Route {
  name: string;
  path?: string;
  menu?: Route[];
}

export const Routes: Route[] = [
  {
    path: "/productos",
    name: "Productos",
  },
  {
    name: "Juega Souls",
    menu: [
      {
        path: "/como-jugar",
        name: "Aprende a jugar",
      },
      {
        path: "/torneos",
        name: "Torneos",
      },
      {
        path: "/eventos",
        name: "Eventos",
      },
      {
        path: "/torneos#jugadores",
        name: "Jugadores",
      },
    ],
  },
  {
    name: "Cartas",
    menu: [
      {
        path: "/cartas",
        name: "Biblioteca",
      },
      {
        path: "/laboratorio",
        name: "Crea tu mazo",
      },
      {
        path: "/mazos",
        name: "Mazo de la comunidad",
      },
      {
        path: "/boveda",
        name: "Boveda",
      },
    ],
  },
  {
    path: "/tiendas",
    name: "Tiendas",
  },
  {
    path: "/noticias",
    name: "Noticias",
  },
];
