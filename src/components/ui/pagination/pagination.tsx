"use client";

import { redirect, usePathname, useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { PaginationLine } from "./paginationLine";

interface Props {
  children: ReactNode;
  totalPages: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const Pagination = ({
  children,
  totalPages,
  currentPage,
  onPageChange,
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isControlled = typeof currentPage === "number" && !!onPageChange;

  const pageString = searchParams.get("page") ?? 1;
  const resolvedPage = isControlled
    ? currentPage ?? 1
    : isNaN(+pageString)
    ? 1
    : +pageString;

  if (!isControlled && (resolvedPage < 1 || isNaN(+pageString))) {
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
        onPageChange={onPageChange}
      />
    </div>
  );
};
