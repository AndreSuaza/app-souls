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

  const baseItemClass = clsx(
    "page-link relative block py-1 px-3 border border-transparent rounded-lg font-semibold transition duration-200 shadow-sm hover:shadow",
    "bg-white text-slate-700 hover:bg-slate-100 dark:bg-tournament-dark-muted dark:text-white dark:hover:bg-tournament-dark-border"
  );
  const activeItemClass = clsx(
    "bg-purple-600 text-white hover:bg-purple-600 dark:bg-purple-500 dark:text-white shadow-lg"
  );

  const renderPageItem = (pageNumber: number | string) => {
    if (pageNumber === "...") {
      return (
        <span className="page-link relative block py-1 px-3 border border-transparent text-slate-400 dark:text-slate-400">
          {pageNumber}
        </span>
      );
    }

    if (pageNumber === "...") {
      return (
        <span className="page-link relative block py-1 px-3 border-0 text-gray-500">
          {pageNumber}
        </span>
      );
    }

    const className = clsx(baseItemClass, {
      [activeItemClass]: pageNumber === currentPage,
    });

    if (isControlled) {
      return (
        <button
          type="button"
          className={className}
          onClick={() => handleControlledChange(Number(pageNumber))}
        >
          {pageNumber}
        </button>
      );
    }

    return (
      <Link className={className} href={createPageUrl(pageNumber)}>
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
      "page-link relative block h-10 w-10 flex items-center justify-center text-slate-700 rounded-lg hover:bg-slate-100 dark:border-tournament-dark-border dark:text-white dark:hover:bg-tournament-dark-border focus:outline-none shadow-sm";

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
    <div className={`${className} mt-3 mb-3 flex justify-center`}>
      <nav aria-label="Pagination Cards" className="flex justify-center">
        <ul className="flex gap-2 items-center">
          {currentPage > 1 && (
            <li className="page-item">
              {renderArrow(
                "prev",
                <IoChevronBackOutline size={22} />,
                currentPage - 1
              )}
            </li>
          )}

          {allPages.map((page, index) => (
            <li key={`${page}+${index}`} className="page-item">
              {renderPageItem(page)}
            </li>
          ))}

          {currentPage < totalPages && (
            <li className="page-item">
              {renderArrow(
                "next",
                <IoChevronForwardOutline size={22} />,
                currentPage + 1
              )}
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
};
