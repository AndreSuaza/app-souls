"use client";

import type { ReactElement } from "react";
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
  onPageChange?: (page: number) => void;
}

export const PaginationLine = ({
  totalPages,
  currentPage,
  searchParams,
  pathname,
  className,
  onPageChange,
}: Props) => {
  const allPages = generatePaginationNumbers(currentPage, totalPages);
  const isControlled = typeof onPageChange === "function";

  const createPageUrl = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams);

    if (isControlled) {
      return `${pathname}`;
    }

    if (pageNumber === "...") {
      return `${pathname}?${params.toString()}`;
    }

    if (+pageNumber <= 0) {
      return `${pathname}`;
    }

    if (+pageNumber > totalPages) {
      return `${pathname}?${params.toString()}`;
    }

    params.set("page", pageNumber.toString());
    return `${pathname}?${params.toString()}`;
  };

  const handleControlledChange = (pageNumber: number) => {
    if (!isControlled || !onPageChange) return;
    if (pageNumber < 1 || pageNumber > totalPages) return;
    onPageChange(pageNumber);
  };

  const renderPageItem = (pageNumber: number | string) => {
    const baseClass = clsx(
      "page-link relative block py-1 px-3 border-0 outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none",
      {
        "bg-indigo-500 shadow-sm text-white hover:text-white hover:bg-indigo-700":
          pageNumber === currentPage,
      }
    );

    if (pageNumber === "...") {
      return (
        <span className="page-link relative block py-1 px-3 border-0 text-gray-500">
          {pageNumber}
        </span>
      );
    }

    if (isControlled) {
      return (
        <button
          type="button"
          className={baseClass}
          onClick={() => handleControlledChange(Number(pageNumber))}
        >
          {pageNumber}
        </button>
      );
    }

    return (
      <Link className={baseClass} href={createPageUrl(pageNumber)}>
        {pageNumber}
      </Link>
    );
  };

  const renderArrow = (
    direction: "prev" | "next",
    icon: ReactElement,
    targetPage: number
  ) => {
    const sharedClass =
      "page-link relative block border-0 bg-transparent outline-none transition-all duration-300 rounded text-gray-800 hover:text-gray-800 hover:bg-gray-200 focus:shadow-none";

    if (isControlled) {
      return (
        <button
          type="button"
          className={sharedClass}
          onClick={() => handleControlledChange(targetPage)}
        >
          {icon}
        </button>
      );
    }

    return (
      <Link className={sharedClass} href={createPageUrl(targetPage)}>
        {icon}
      </Link>
    );
  };

  return (
    <div className={`${className} text-center mt-3 mb-3 md:flex`}>
      <nav aria-label="Pagination Cards" className="mt-4 mx-4">
        <ul className="flex list-style-none">
          <li className="page-item">
            {renderArrow("prev", <IoChevronBackOutline size={30} />, currentPage - 1)}
          </li>

          {allPages.map((page, index) => (
            <li key={`${page}+${index}`} className="page-item hidden md:block">
              {renderPageItem(page)}
            </li>
          ))}

          <li className="page-item">
            {renderArrow(
              "next",
              <IoChevronForwardOutline size={30} />,
              currentPage + 1
            )}
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
