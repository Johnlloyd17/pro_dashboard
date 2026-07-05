"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import React from "react";
import { PaginationComponentProps } from "@/lib/types";

export function PaginationComponent({
  currentPage,
  totalPages,
}: PaginationComponentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  // Build a simple page-number list: always show first, last, current, and neighbors
  const pageNumbers = new Set<number>();
  pageNumbers.add(1);
  pageNumbers.add(totalPages);
  pageNumbers.add(currentPage);
  if (currentPage > 1) pageNumbers.add(currentPage - 1);
  if (currentPage < totalPages) pageNumbers.add(currentPage + 1);

  const sortedPages = Array.from(pageNumbers)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);

  return (
    <Pagination className="flex justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) goToPage(currentPage - 1);
            }}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {sortedPages.map((page, index) => {
          const prevPage = sortedPages[index - 1];
          const showEllipsisBefore =
            prevPage !== undefined && page - prevPage > 1;

          return (
            <React.Fragment key={page}>
              {showEllipsisBefore && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    goToPage(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </React.Fragment>
          );
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < totalPages) goToPage(currentPage + 1);
            }}
            className={
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
