"use client";

import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
}: PaginationProps) {
  // 페이지 번호 배열 생성 (최대 10개 표시)
  const getPageNumbers = () => {
    const maxVisiblePages = 10;
    const pages: number[] = [];

    if (totalPages <= maxVisiblePages) {
      // 총 페이지가 10개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 현재 페이지 기준으로 앞뒤 페이지 표시
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      // 끝에 도달하면 시작점 조정
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      {/* 처음으로 */}
      {currentPage > 1 && (
        <>
          <Link
            href={`/?page=1&pageSize=${pageSize}`}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            처음
          </Link>
          <Link
            href={`/?page=${currentPage - 1}&pageSize=${pageSize}`}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            이전
          </Link>
        </>
      )}

      {/* 페이지 번호 */}
      {pageNumbers.map((page) => (
        <Link
          key={page}
          href={`/?page=${page}&pageSize=${pageSize}`}
          className={`px-3 py-2 rounded-md transition-colors ${
            page === currentPage
              ? "bg-blue-500 text-white font-semibold"
              : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          }`}
        >
          {page}
        </Link>
      ))}

      {/* 다음, 마지막 */}
      {currentPage < totalPages && (
        <>
          <Link
            href={`/?page=${currentPage + 1}&pageSize=${pageSize}`}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            다음
          </Link>
          <Link
            href={`/?page=${totalPages}&pageSize=${pageSize}`}
            className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            마지막
          </Link>
        </>
      )}
    </div>
  );
}
