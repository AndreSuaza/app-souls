export interface Route {
  path: string;
  name: string;
}

export const Routes = [
  {
    path: "/como-jugar",
    name: "Aprende a Jugar",
  },
  // {
  //   path: "/torneos",
  //   name: "Torneos",
  // },
  {
    name: "Cartas",
    menu: [
      {
        path: "/cartas",
        name: "biblioteca",
      },
      {
        path: "/mazos",
        name: "Mazos",
      },
      {
        path: "/laboratorio",
        name: "Laboratorio",
      },
      {
        path: "preguntas-frecuentes",
        name: "Preguntas Frecuentes",
      },
    ],
  },
  {
    path: "/productos",
    name: "Productos",
    title: "Productos",
  },
  {
    path: "/tiendas",
    name: "Tiendas",
  },
  {
    path: "/boveda",
    name: "Bóveda",
  },
];
