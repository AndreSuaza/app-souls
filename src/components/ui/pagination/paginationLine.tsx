"use client";

import Link from "next/link";
import clsx from "clsx";
import { ReadonlyURLSearchParams } from "next/navigation";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import { generatePaginationNumbers } from "@/utils";

interface Props {
  totalPages: number;
  currentPage: number;
  searchParams: ReadonlyURLSearchParams;
  pathname: string;
  className?: string;
}

export const PaginationLine = ({
  totalPages,
  currentPage,
  searchParams,
  pathname,
  className,
}: Props) => {
  const allPages = generatePaginationNumbers(currentPage, totalPages);

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);

    if (pageNumber === "...") {
      return `${pathname}?${params.toString()}`;
    }

    if (+pageNumber <= 0) {
      return `${pathname}`; //   href="/kid";
    }

    if (+pageNumber > totalPages) {
      // Next >
      return `${pathname}?${params.toString()}`;
    }

    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className={`${className} text-center mt-3 mb-3 md:flex`}>
      <nav aria-label="Pagination Cards" className="mt-4 mx-4">
        <ul className="flex list-style-none">
          <li className="page-item">
            <Link
              className="page-link relative block  border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              href={createPageUrl(currentPage - 1)}
            >
              <IoChevronBackOutline size={30} />
            </Link>
          </li>

          {allPages.map((page, index) => (
            <li key={`${page}+${index}`} className="page-item hidden md:block">
              <Link
                className={clsx(
                  "page-link relative block py-1 px-3 border-0 outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none",
                  {
                    "bg-indigo-500 shadow-sm text-white hover:text-white hover:bg-indigo-700":
                      page === currentPage,
                  }
                )}
                href={createPageUrl(page)}
              >
                {page}
              </Link>
            </li>
          ))}

          <li className="page-item">
            <Link
              className="page-link relative block border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none"
              href={createPageUrl(currentPage + 1)}
            >
              <IoChevronForwardOutline size={30} />
            </Link>
          </li>
        </ul>
        <div className="md:hidden page-link relative block border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none">
          <p className="font-bold">
            Pag <span className="text-indigo-600">{currentPage}</span> de{" "}
            {totalPages}
          </p>
        </div>
      </nav>
    </div>
  );
};
