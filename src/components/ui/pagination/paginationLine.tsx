"use client";

import { useEffect, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const measureListRef = useRef<HTMLUListElement | null>(null);
  const [isCompactLayout, setIsCompactLayout] = useState(false);

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

  const baseItemClass =
    "page-link relative block py-1 px-2 sm:px-3 border border-transparent rounded-lg font-semibold text-xs sm:text-sm transition duration-200 shadow-sm hover:shadow";
  const inactiveItemClass =
    "bg-white text-slate-700 hover:bg-slate-100 dark:bg-tournament-dark-muted dark:text-white dark:hover:bg-tournament-dark-border";
  const activeItemClass =
    "bg-purple-600 text-white hover:bg-purple-600 dark:bg-purple-500 dark:text-white shadow-lg border-purple-600 dark:border-purple-400";

  const renderPageItem = (pageNumber: number | string) => {
    if (pageNumber === "...") {
      return (
        <span className="page-link relative block py-1 px-2 sm:px-3 border border-transparent text-xs sm:text-sm text-slate-400 dark:text-slate-400">
          {pageNumber}
        </span>
      );
    }

    if (pageNumber === "...") {
      return (
        <span className="page-link relative block py-1 px-2 sm:px-3 border-0 text-xs sm:text-sm text-gray-500">
          {pageNumber}
        </span>
      );
    }

    const isActive = Number(pageNumber) === currentPage;
    const className = clsx(
      baseItemClass,
      isActive ? activeItemClass : inactiveItemClass
    );

    if (isControlled) {
      return (
        <button
          type="button"
          className={className}
          aria-current={isActive ? "page" : undefined}
          onClick={() => handleControlledChange(Number(pageNumber))}
        >
          {pageNumber}
        </button>
      );
    }

    return (
      <Link
        className={className}
        href={createPageUrl(pageNumber)}
        scroll={false}
        aria-current={isActive ? "page" : undefined}
      >
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
      "page-link relative block h-7 w-7 sm:h-10 sm:w-10 flex items-center justify-center text-slate-700 rounded-lg hover:bg-slate-100 dark:border-tournament-dark-border dark:text-white dark:hover:bg-tournament-dark-border focus:outline-none shadow-sm";

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
      <Link className={sharedClass} href={createPageUrl(targetPage)} scroll={false}>
        {icon}
      </Link>
    );
  };

  useEffect(() => {
    const container = containerRef.current;
    const measureList = measureListRef.current;
    if (!container || !measureList) return;

    const updateLayout = () => {
      const availableWidth = container.getBoundingClientRect().width;
      const fullWidth = measureList.scrollWidth;
      // Alterna a compacto solo cuando el layout completo no entra en el ancho disponible.
      setIsCompactLayout((prev) => {
        const shouldCompact = fullWidth > availableWidth;
        return prev === shouldCompact ? prev : shouldCompact;
      });
    };

    updateLayout();

    const observer = new ResizeObserver(() => {
      updateLayout();
    });

    observer.observe(container);
    observer.observe(measureList);

    return () => {
      observer.disconnect();
    };
  }, [allPages.length, currentPage, totalPages]);

  return (
    <div className={clsx("mt-3 mb-3 flex justify-center", className)}>
      <div ref={containerRef} className="relative w-full">
        <nav aria-label="Pagination Cards" className="flex justify-center">
          {isCompactLayout ? (
            <div className="flex flex-col items-center gap-1">
              <ul className="flex gap-2 items-center">
                {currentPage > 1 && (
                  <li className="page-item">
                    {renderArrow(
                      "prev",
                      <IoChevronBackOutline className="h-3 w-3 sm:h-5 sm:w-5" />,
                      currentPage - 1
                    )}
                  </li>
                )}

                <li className="page-item">
                  {renderPageItem(currentPage)}
                </li>

                {currentPage < totalPages && (
                  <li className="page-item">
                    {renderArrow(
                      "next",
                      <IoChevronForwardOutline className="h-3 w-3 sm:h-5 sm:w-5" />,
                      currentPage + 1
                    )}
                  </li>
                )}
              </ul>
              <span className="text-xs text-slate-600 dark:text-slate-300">
                Pag. {currentPage} de {totalPages}
              </span>
            </div>
          ) : (
            <ul className="flex gap-2 items-center">
              {currentPage > 1 && (
                <li className="page-item">
                  {renderArrow(
                    "prev",
                    <IoChevronBackOutline className="h-3 w-3 sm:h-5 sm:w-5" />,
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
                    <IoChevronForwardOutline className="h-3 w-3 sm:h-5 sm:w-5" />,
                    currentPage + 1
                  )}
                </li>
              )}
            </ul>
          )}
        </nav>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 -z-10 h-0 overflow-hidden opacity-0"
        >
          <ul ref={measureListRef} className="flex gap-2 items-center">
            {currentPage > 1 && (
              <li className="page-item">
                {renderArrow(
                  "prev",
                  <IoChevronBackOutline className="h-3 w-3 sm:h-5 sm:w-5" />,
                  currentPage - 1
                )}
              </li>
            )}

            {allPages.map((page, index) => (
              <li key={`measure-${page}+${index}`} className="page-item">
                {renderPageItem(page)}
              </li>
            ))}

            {currentPage < totalPages && (
              <li className="page-item">
                {renderArrow(
                  "next",
                  <IoChevronForwardOutline className="h-3 w-3 sm:h-5 sm:w-5" />,
                  currentPage + 1
                )}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};
