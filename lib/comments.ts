import { Comment } from "@/types/comment";

// 임시 데이터 저장소 (실제 프로젝트에서는 데이터베이스 사용)
let comments: Comment[] = [
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

// 특정 게시글의 모든 댓글 조회
export function getCommentsByPostId(postId: number): Comment[] {
  return comments
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// 댓글 생성
export function createComment(
  data: Omit<Comment, "id" | "createdAt">
): Comment {
  const newComment: Comment = {
    id: comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1,
    ...data,
    createdAt: new Date(),
  };
  comments.push(newComment);
  return newComment;
}

// 댓글 삭제
export function deleteComment(id: number): boolean {
  const index = comments.findIndex((c) => c.id === id);
  if (index !== -1) {
    comments.splice(index, 1);
    return true;
  }
  return false;
}

// 특정 게시글의 댓글 개수
export function getCommentCount(postId: number): number {
  return comments.filter((comment) => comment.postId === postId).length;
}
