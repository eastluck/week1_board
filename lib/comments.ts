import { Comment } from "@/types/comment";
import {
  loadComments,
  addComment,
  getCommentsByPostId as getCommentsByPostIdFromStorage,
  deleteCommentById,
} from "./storage/commentStorage";

// 특정 게시글의 모든 댓글 조회
export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  return await getCommentsByPostIdFromStorage(postId);
}

// 댓글 생성
export async function createComment(
  data: Omit<Comment, "id" | "createdAt">
): Promise<Comment> {
  return await addComment(data);
}

// 댓글 삭제
export async function deleteComment(id: number): Promise<boolean> {
  return await deleteCommentById(id);
}

// 특정 게시글의 댓글 개수
export async function getCommentCount(postId: number): Promise<number> {
  const comments = await getCommentsByPostIdFromStorage(postId);
  return comments.length;
}

// 샘플 댓글 데이터 생성 함수 (마이그레이션용)
export function generateSampleComments(): Comment[] {
  return [
    {
      id: 1,
      postId: 1,
      content: "첫 번째 댓글입니다!",
      author: "사용자1",
      createdAt: new Date("2024-01-01T10:00:00"),
    },
    {
      id: 2,
      postId: 1,
      content: "Next.js 정말 좋네요!",
      author: "사용자2",
      createdAt: new Date("2024-01-01T11:00:00"),
    },
    {
      id: 3,
      postId: 2,
      content: "도움이 되는 글이네요. 감사합니다!",
      author: "사용자3",
      createdAt: new Date("2024-01-02T09:00:00"),
    },
  ];
}
