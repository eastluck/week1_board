import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost } from "@/lib/posts";
import { getCommentsByPostId } from "@/lib/comments";
import CommentSection from "./CommentSection";

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(parseInt(id));

  if (!post) {
    notFound();
  }

  const comments = await getCommentsByPostId(parseInt(id));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow">
          {/* 헤더 */}
          <div className="border-b border-gray-200 px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>작성자: {post.author}</span>
              <span>
                작성일: {new Date(post.createdAt).toLocaleDateString("ko-KR")}
              </span>
              <span>조회: {post.views}</span>
            </div>
          </div>

          {/* 본문 */}
          <div className="px-6 py-8">
            <div className="prose max-w-none text-gray-700 whitespace-pre-wrap">
              {post.content}
            </div>
          </div>

          {/* 댓글 섹션 */}
          <div className="px-6 pb-8">
            <CommentSection postId={parseInt(id)} initialComments={comments} />
          </div>

          {/* 하단 버튼 */}
          <div className="border-t border-gray-200 px-6 py-4 flex justify-between">
            <Link
              href="/"
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              목록으로
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
