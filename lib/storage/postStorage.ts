import { Post } from "@/types/post";
import { PostsData } from "@/types/storage";
import {
  readJsonFile,
  writeJsonFileWithLock,
  fileExists,
} from "./fileStorage";

const POSTS_FILE = "posts.json";

// 초기 데이터 구조
function createInitialPostsData(): PostsData {
  return {
    posts: [],
    metadata: {
      lastId: 0,
      totalCount: 0,
      lastUpdated: new Date().toISOString(),
    },
  };
}

// 모든 게시글 로드
export async function loadPosts(): Promise<Post[]> {
  try {
    const exists = await fileExists(POSTS_FILE);
    if (!exists) {
      // 파일이 없으면 초기화
      await initializePostsData();
      return [];
    }

    const data = await readJsonFile<PostsData>(POSTS_FILE);

    // Date 객체로 변환
    return data.posts.map((post) => ({
      ...post,
      createdAt: new Date(post.createdAt),
    }));
  } catch (error) {
    console.error("Error loading posts:", error);
    return [];
  }
}

// 게시글 저장
export async function savePosts(posts: Post[]): Promise<void> {
  const data: PostsData = {
    posts: posts.map((post) => ({
      ...post,
      createdAt: post.createdAt.toISOString() as unknown as Date,
    })),
    metadata: {
      lastId: posts.length > 0 ? Math.max(...posts.map((p) => p.id)) : 0,
      totalCount: posts.length,
      lastUpdated: new Date().toISOString(),
    },
  };

  await writeJsonFileWithLock(POSTS_FILE, data);
}

// 게시글 추가
export async function addPost(
  post: Omit<Post, "id" | "createdAt" | "views">
): Promise<Post> {
  const posts = await loadPosts();

  const newId =
    posts.length > 0 ? Math.max(...posts.map((p) => p.id)) + 1 : 1;

  const newPost: Post = {
    id: newId,
    ...post,
    createdAt: new Date(),
    views: 0,
  };

  posts.push(newPost);
  await savePosts(posts);

  return newPost;
}

// 게시글 조회 (조회수 증가)
export async function getPostById(id: number): Promise<Post | null> {
  const posts = await loadPosts();
  const post = posts.find((p) => p.id === id);

  if (post) {
    // 조회수 증가
    post.views++;
    await savePosts(posts);
  }

  return post || null;
}

// 게시글 업데이트
export async function updatePost(
  id: number,
  updates: Partial<Post>
): Promise<Post | null> {
  const posts = await loadPosts();
  const index = posts.findIndex((p) => p.id === id);

  if (index === -1) {
    return null;
  }

  posts[index] = { ...posts[index], ...updates };
  await savePosts(posts);

  return posts[index];
}

// 게시글 삭제
export async function deletePostById(id: number): Promise<boolean> {
  const posts = await loadPosts();
  const index = posts.findIndex((p) => p.id === id);

  if (index === -1) {
    return false;
  }

  posts.splice(index, 1);
  await savePosts(posts);

  return true;
}

// 초기 데이터 생성
export async function initializePostsData(): Promise<void> {
  const data = createInitialPostsData();
  await writeJsonFileWithLock(POSTS_FILE, data);
}
