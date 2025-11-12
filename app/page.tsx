import Link from "next/link";
import { getPostsWithPagination } from "@/lib/posts";
import { getCommentCount } from "@/lib/comments";
import Pagination from "./Pagination";
import PageSizeSelector from "./PageSizeSelector";

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = Number(params.pageSize) || 10;

  const { posts, totalCount, totalPages, currentPage } = getPostsWithPagination(
    page,
    pageSize
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          {/* 헤더 */}
          <div className="border-b border-gray-200 px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">게시판</h1>
              <p className="text-sm text-gray-500 mt-1">
                전체 {totalCount}개
              </p>
            </div>
            <Link
              href="/posts/new"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              글쓰기
            </Link>
          </div>

          {/* 페이지 사이즈 선택 */}
          <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
            <PageSizeSelector currentPageSize={pageSize} />
          </div>

          {/* 게시글 목록 */}
          <div className="divide-y divide-gray-200">
            {posts.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                게시글이 없습니다.
              </div>
            ) : (
              await Promise.all(
                posts.map(async (post) => {
                  const commentCount = await getCommentCount(post.id);
                  return (
                    <Link
                      key={post.id}
                      href={`/posts/${post.id}`}
                      className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h2 className="text-lg font-semibold text-gray-800 mb-1">
                            {post.title}
                            {commentCount > 0 && (
                              <span className="ml-2 text-blue-500 text-sm">
                                [{commentCount}]
                              </span>
                            )}
                          </h2>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{post.author}</span>
                            <span>
                              {new Date(post.createdAt).toLocaleDateString(
                                "ko-KR"
                              )}
                            </span>
                            <span>조회 {post.views}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )
            )}
          </div>

          {/* 페이지네이션 */}
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
