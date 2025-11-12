import { Comment } from "@/types/comment";
import { CommentsData } from "@/types/storage";
import {
  readJsonFile,
  writeJsonFileWithLock,
  fileExists,
} from "./fileStorage";

const COMMENTS_FILE = "comments.json";

// 초기 데이터 구조
function createInitialCommentsData(): CommentsData {
  return {
    comments: [],
    metadata: {
      lastId: 0,
      totalCount: 0,
      lastUpdated: new Date().toISOString(),
    },
  };
}

// 모든 댓글 로드
export async function loadComments(): Promise<Comment[]> {
  try {
    const exists = await fileExists(COMMENTS_FILE);
    if (!exists) {
      // 파일이 없으면 초기화
      await initializeCommentsData();
      return [];
    }

    const data = await readJsonFile<CommentsData>(COMMENTS_FILE);

    // Date 객체로 변환
    return data.comments.map((comment) => ({
      ...comment,
      createdAt: new Date(comment.createdAt),
    }));
  } catch (error) {
    console.error("Error loading comments:", error);
    return [];
  }
}

// 댓글 저장
export async function saveComments(comments: Comment[]): Promise<void> {
  const data: CommentsData = {
    comments: comments.map((comment) => ({
      ...comment,
      createdAt: comment.createdAt.toISOString() as unknown as Date,
    })),
    metadata: {
      lastId: comments.length > 0 ? Math.max(...comments.map((c) => c.id)) : 0,
      totalCount: comments.length,
      lastUpdated: new Date().toISOString(),
    },
  };

  await writeJsonFileWithLock(COMMENTS_FILE, data);
}

// 댓글 추가
export async function addComment(
  comment: Omit<Comment, "id" | "createdAt">
): Promise<Comment> {
  const comments = await loadComments();

  const newId =
    comments.length > 0 ? Math.max(...comments.map((c) => c.id)) + 1 : 1;

  const newComment: Comment = {
    id: newId,
    ...comment,
    createdAt: new Date(),
  };

  comments.push(newComment);
  await saveComments(comments);

  return newComment;
}

// 게시글별 댓글 조회
export async function getCommentsByPostId(
  postId: number
): Promise<Comment[]> {
  const comments = await loadComments();
  return comments
    .filter((c) => c.postId === postId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}

// 댓글 삭제
export async function deleteCommentById(id: number): Promise<boolean> {
  const comments = await loadComments();
  const index = comments.findIndex((c) => c.id === id);

  if (index === -1) {
    return false;
  }

  comments.splice(index, 1);
  await saveComments(comments);

  return true;
}

// 초기 데이터 생성
export async function initializeCommentsData(): Promise<void> {
  const data = createInitialCommentsData();
  await writeJsonFileWithLock(COMMENTS_FILE, data);
}
