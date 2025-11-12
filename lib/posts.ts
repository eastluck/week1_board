import { Post } from "@/types/post";

// 샘플 데이터 생성 함수
function generateSamplePosts(): Post[] {
  const titles = [
    "Next.js 게시판에 오신 것을 환영합니다!",
    "Next.js 시작하기",
    "TypeScript와 함께하는 개발",
    "React Hooks 완벽 가이드",
    "Tailwind CSS로 스타일링하기",
    "서버 사이드 렌더링(SSR) 이해하기",
    "API 라우트 활용법",
    "데이터베이스 연동 방법",
    "인증과 권한 관리",
    "성능 최적화 팁",
    "웹 접근성 개선하기",
    "SEO 최적화 전략",
    "테스트 코드 작성하기",
    "CI/CD 파이프라인 구축",
    "Docker로 배포하기",
    "AWS 클라우드 서비스",
    "GraphQL vs REST API",
    "마이크로서비스 아키텍처",
    "프론트엔드 트렌드 2024",
    "개발자 생산성 도구",
  ];

  const contents = [
    "상세한 내용이 여기에 들어갑니다. 유용한 정보와 팁을 공유합니다.",
    "이 글에서는 실전 예제와 함께 자세히 설명합니다.",
    "초보자도 쉽게 따라할 수 있는 튜토리얼입니다.",
    "실무에서 바로 적용 가능한 내용들을 다룹니다.",
    "최신 기술 트렌드와 베스트 프랙티스를 소개합니다.",
  ];

  const authors = ["관리자", "개발자", "사용자1", "사용자2", "사용자3", "전문가", "초보자", "선임개발자"];

  const samplePosts: Post[] = [];
  const startDate = new Date("2024-01-01");

  for (let i = 1; i <= 100; i++) {
    const titleIndex = (i - 1) % titles.length;
    const contentIndex = (i - 1) % contents.length;
    const authorIndex = (i - 1) % authors.length;

    const dayOffset = Math.floor((i - 1) / 3);
    const postDate = new Date(startDate);
    postDate.setDate(postDate.getDate() + dayOffset);

    samplePosts.push({
      id: i,
      title: `${titles[titleIndex]} (${i})`,
      content: `${contents[contentIndex]}\n\n게시글 번호: ${i}`,
      author: authors[authorIndex],
      createdAt: postDate,
      views: Math.floor(Math.random() * 100),
    });
  }

  return samplePosts;
}

// 임시 데이터 저장소 (실제 프로젝트에서는 데이터베이스 사용)
let posts: Post[] = generateSamplePosts();

// 모든 게시글 조회
export function getPosts(): Post[] {
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

// 페이지네이션을 위한 게시글 조회
export function getPostsWithPagination(page: number = 1, pageSize: number = 10): {
  posts: Post[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
} {
  const sortedPosts = posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const totalCount = sortedPosts.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  return {
    posts: paginatedPosts,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  };
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
