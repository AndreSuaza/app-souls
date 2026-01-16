// [1,2,3,4,5,..., 7]
// [1,2,3,...,48, 49, 50]
export const generatePaginationNumbers = (
  currentPage: number,
  totalPages: number
) => {
  // Si el numero total de paginas es 7 o menos
  // vamos a mostrar todas las paginas sin puntos suspensivos
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Si la pagina actual esta en las primeras 2 paginas
  // mostrar 1-3, puntos suspensivos y las ultimas 2
  if (currentPage <= 2) {
    return [1, 2, 3, "...", totalPages - 1, totalPages];
  }

  // Si la pagina actual es 3, incluir la pagina 4
  if (currentPage === 3) {
    return [1, 2, 3, 4, "...", totalPages - 1, totalPages];
  }

  // Si la pagina actual esta entre las ultimas 3 paginas
  // mostrar las primeras 2, puntos suspensivos, las ultimas 3 paginas
  if (currentPage >= totalPages - 2) {
    return [
      1,
      2,
      "...",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  // Si la pagina actual esta en otro lugar medio
  // mostrar la primera pagina, puntos suspensivos, la pagina actual y vecinos
  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
};
