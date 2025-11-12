"use client";

import { useState } from "react";
import { Comment } from "@/types/comment";

interface CommentSectionProps {
  postId: number;
  initialComments: Comment[];
}

export default function CommentSection({
  postId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [content, setContent] = useState("");
  const [author, setAuthor] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim() || !author.trim()) {
      alert("모든 필드를 입력해주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId,
          content,
          author,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setContent("");
        setAuthor("");
      } else {
        alert("댓글 작성에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error creating comment:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-t border-gray-200 mt-8 pt-8">
      {/* 댓글 목록 */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        댓글 ({comments.length})
      </h2>

      {comments.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          첫 번째 댓글을 작성해보세요!
        </p>
      ) : (
        <div className="space-y-4 mb-8">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-800">
                  {comment.author}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(comment.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* 댓글 작성 폼 */}
      <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          댓글 작성
        </h3>

        <div className="space-y-4">
          {/* 작성자 */}
          <div>
            <label
              htmlFor="author"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              작성자
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="이름을 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 댓글 내용 */}
          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              내용
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="댓글을 입력하세요"
              disabled={isSubmitting}
            />
          </div>

          {/* 작성 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "작성 중..." : "댓글 작성"}
          </button>
        </div>
      </form>
    </div>
  );
}
