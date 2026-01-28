"use client";

import { redirect, usePathname, useSearchParams } from "next/navigation";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { PaginationLine } from "./paginationLine";
export { PaginationStats } from "./PaginationStats";

interface Props {
  children: ReactNode;
  totalPages: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

const EMPTY_SEARCH_PARAMS = new URLSearchParams() as ReadonlyURLSearchParams;

const PaginationControlled = ({
  children,
  totalPages,
  currentPage,
  onPageChange,
}: Props) => {
  const resolvedPage = currentPage ?? 1;

  // Mantiene estable el HTML en paginacion controlada evitando depender de la URL.
  return (
    <div className="space-y-10">
      {children}
      <PaginationLine
        currentPage={resolvedPage}
        pathname=""
        searchParams={EMPTY_SEARCH_PARAMS}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

const PaginationUncontrolled = ({ children, totalPages }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageString = searchParams.get("page") ?? 1;
  const resolvedPage = isNaN(+pageString) ? 1 : +pageString;

  if (resolvedPage < 1 || isNaN(+pageString)) {
    redirect(pathname);
  }

  return (
    <div className="space-y-10">
      {children}
      <PaginationLine
        currentPage={resolvedPage}
        pathname={pathname}
        searchParams={searchParams}
        totalPages={totalPages}
      />
    </div>
  );
};

export const Pagination = (props: Props) => {
  const isControlled =
    typeof props.currentPage === "number" && !!props.onPageChange;

  return isControlled ? (
    <PaginationControlled {...props} />
  ) : (
    <PaginationUncontrolled {...props} />
  );
};
