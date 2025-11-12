"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PageSizeSelectorProps {
  currentPageSize: number;
}

export default function PageSizeSelector({
  currentPageSize,
}: PageSizeSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pageSizes = [10, 30, 50, 100];

  const handlePageSizeChange = (newPageSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", newPageSize.toString());
    params.set("page", "1"); // 페이지 사이즈 변경 시 첫 페이지로
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">페이지당 표시:</span>
      <div className="flex gap-1">
        {pageSizes.map((size) => (
          <button
            key={size}
            onClick={() => handlePageSizeChange(size)}
            className={`px-3 py-1 rounded-md text-sm transition-colors ${
              size === currentPageSize
                ? "bg-blue-500 text-white font-semibold"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            {size}개
          </button>
        ))}
      </div>
    </div>
  );
}
