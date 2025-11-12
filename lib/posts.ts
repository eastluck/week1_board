import { Post } from "@/types/post";

// 임시 데이터 저장소 (실제 프로젝트에서는 데이터베이스 사용)
let posts: Post[] = [
  {
    id: 1,
    title: "Next.js 게시판에 오신 것을 환영합니다!",
    content: "이것은 첫 번째 게시글입니다. Next.js App Router를 사용하여 만든 게시판입니다.",
    author: "관리자",
    createdAt: new Date("2024-01-01"),
    views: 10,
  },
  {
    id: 2,
    title: "Next.js 시작하기",
    content: "Next.js는 React 기반의 프레임워크입니다. 서버 사이드 렌더링과 정적 사이트 생성을 지원합니다.",
    author: "개발자",
    createdAt: new Date("2024-01-02"),
    views: 5,
  },
  {
    id: 3,
    title: "TypeScript와 함께하는 개발",
    content: "TypeScript를 사용하면 타입 안정성을 확보할 수 있습니다.",
    author: "개발자",
    createdAt: new Date("2024-01-03"),
    views: 8,
  },
];

// 모든 게시글 조회
export function getPosts(): Post[] {
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// 특정 게시글 조회
export function getPost(id: number): Post | undefined {
  const post = posts.find((p) => p.id === id);
  if (post) {
    // 조회수 증가
    post.views++;
  }
  return post;
}

// 게시글 생성
export function createPost(data: Omit<Post, "id" | "createdAt" | "views">): Post {
  const newPost: Post = {
    id: posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1,
    ...data,
    createdAt: new Date(),
    views: 0,
  };
  posts.push(newPost);
  return newPost;
}

// 게시글 삭제
export function deletePost(id: number): boolean {
  const index = posts.findIndex((p) => p.id === id);
  if (index !== -1) {
    posts.splice(index, 1);
    return true;
  }
  return false;
}
