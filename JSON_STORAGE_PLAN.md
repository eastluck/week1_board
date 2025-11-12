# JSON 파일 기반 데이터 관리 계획서

## 📋 목차
1. [개요](#개요)
2. [JSON 파일 구조](#json-파일-구조)
3. [디렉토리 구조](#디렉토리-구조)
4. [데이터 모델](#데이터-모델)
5. [구현 계획](#구현-계획)
6. [API 설계](#api-설계)
7. [주의사항](#주의사항)
8. [마이그레이션 계획](#마이그레이션-계획)

---

## 개요

### 목표
- 메모리 기반 데이터를 로컬 JSON 파일로 영구 저장
- 서버 재시작 시에도 데이터 유지
- 파일 시스템을 데이터베이스처럼 활용

### 장점
- 데이터베이스 설치 불필요
- 데이터 직접 확인 및 수정 가능
- 백업 및 버전 관리 용이
- 개발/테스트 환경에 적합

### 단점
- 동시성 제어 어려움 (파일 잠금 필요)
- 대용량 데이터 처리 성능 저하
- 관계형 쿼리 불가능
- 프로덕션 환경에는 부적합

---

## JSON 파일 구조

### 1. 게시글 데이터 (posts.json)

```json
{
  "posts": [
    {
      "id": 1,
      "title": "Next.js 게시판에 오신 것을 환영합니다!",
      "content": "이것은 첫 번째 게시글입니다.",
      "author": "관리자",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "views": 10
    },
    {
      "id": 2,
      "title": "Next.js 시작하기",
      "content": "Next.js는 React 기반의 프레임워크입니다.",
      "author": "개발자",
      "createdAt": "2024-01-02T00:00:00.000Z",
      "views": 5
    }
  ],
  "metadata": {
    "lastId": 2,
    "totalCount": 2,
    "lastUpdated": "2024-01-12T10:30:00.000Z"
  }
}
```

**필드 설명:**
- `posts`: 게시글 배열
- `metadata.lastId`: 마지막으로 사용된 ID (자동 증가용)
- `metadata.totalCount`: 총 게시글 수
- `metadata.lastUpdated`: 마지막 업데이트 시간

### 2. 댓글 데이터 (comments.json)

```json
{
  "comments": [
    {
      "id": 1,
      "postId": 1,
      "content": "첫 번째 댓글입니다!",
      "author": "사용자1",
      "createdAt": "2024-01-01T10:00:00.000Z"
    },
    {
      "id": 2,
      "postId": 1,
      "content": "유용한 정보 감사합니다!",
      "author": "사용자2",
      "createdAt": "2024-01-01T11:00:00.000Z"
    },
    {
      "id": 3,
      "postId": 2,
      "content": "도움이 되는 글이네요.",
      "author": "사용자3",
      "createdAt": "2024-01-02T09:00:00.000Z"
    }
  ],
  "metadata": {
    "lastId": 3,
    "totalCount": 3,
    "lastUpdated": "2024-01-12T10:30:00.000Z"
  }
}
```

**필드 설명:**
- `comments`: 댓글 배열
- `postId`: 게시글 ID (외래 키 역할)
- `metadata.lastId`: 마지막으로 사용된 댓글 ID

### 3. 설정 파일 (config.json) - 선택사항

```json
{
  "app": {
    "name": "Board App",
    "version": "1.0.0"
  },
  "storage": {
    "dataDirectory": "data",
    "autoBackup": true,
    "backupInterval": 3600000
  },
  "pagination": {
    "defaultPageSize": 10,
    "allowedPageSizes": [10, 30, 50, 100]
  }
}
```

---

## 디렉토리 구조

```
board-app/
├── data/                          # JSON 데이터 저장 디렉토리
│   ├── posts.json                 # 게시글 데이터
│   ├── comments.json              # 댓글 데이터
│   ├── config.json                # 설정 (선택)
│   └── backups/                   # 백업 디렉토리 (선택)
│       ├── posts_2024-01-12.json
│       └── comments_2024-01-12.json
├── lib/
│   ├── storage/                   # 파일 저장소 관련
│   │   ├── fileStorage.ts         # 파일 읽기/쓰기 유틸
│   │   ├── postStorage.ts         # 게시글 저장소
│   │   └── commentStorage.ts      # 댓글 저장소
│   ├── posts.ts                   # 게시글 비즈니스 로직 (수정)
│   └── comments.ts                # 댓글 비즈니스 로직 (수정)
├── .gitignore                     # data/ 디렉토리 제외
└── ...
```

---

## 데이터 모델

### TypeScript 인터페이스

#### PostsData (posts.json 전체 구조)
```typescript
interface PostsData {
  posts: Post[];
  metadata: {
    lastId: number;
    totalCount: number;
    lastUpdated: string;
  };
}
```

#### CommentsData (comments.json 전체 구조)
```typescript
interface CommentsData {
  comments: Comment[];
  metadata: {
    lastId: number;
    totalCount: number;
    lastUpdated: string;
  };
}
```

#### Post (기존 유지)
```typescript
interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: Date;  // JSON에서는 ISO string
  views: number;
}
```

#### Comment (기존 유지)
```typescript
interface Comment {
  id: number;
  postId: number;
  content: string;
  author: string;
  createdAt: Date;  // JSON에서는 ISO string
}
```

---

## 구현 계획

### Phase 1: 파일 저장소 유틸리티 생성

#### 1.1 `lib/storage/fileStorage.ts` - 기본 파일 I/O
```typescript
import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// 파일 읽기
export async function readJsonFile<T>(filename: string): Promise<T>

// 파일 쓰기 (원자적 쓰기)
export async function writeJsonFile<T>(filename: string, data: T): Promise<void>

// 데이터 디렉토리 초기화
export async function ensureDataDirectory(): Promise<void>

// 파일 존재 확인
export async function fileExists(filename: string): Promise<boolean>
```

**주요 기능:**
- `fs/promises` 사용 (비동기 처리)
- 원자적 쓰기: 임시 파일 → 이름 변경 (데이터 손실 방지)
- 에러 처리: 파일 없음, 권한 오류 등
- 파일 잠금: 동시 쓰기 방지 (선택)

#### 1.2 `lib/storage/postStorage.ts` - 게시글 저장소
```typescript
import { Post } from '@/types/post';

interface PostsData {
  posts: Post[];
  metadata: {
    lastId: number;
    totalCount: number;
    lastUpdated: string;
  };
}

// 모든 게시글 로드
export async function loadPosts(): Promise<Post[]>

// 게시글 저장
export async function savePosts(posts: Post[]): Promise<void>

// 게시글 추가
export async function addPost(post: Omit<Post, 'id'>): Promise<Post>

// 게시글 업데이트
export async function updatePost(id: number, updates: Partial<Post>): Promise<Post | null>

// 게시글 삭제
export async function deletePost(id: number): Promise<boolean>

// 초기 데이터 생성
export async function initializePostsData(): Promise<void>
```

#### 1.3 `lib/storage/commentStorage.ts` - 댓글 저장소
```typescript
import { Comment } from '@/types/comment';

interface CommentsData {
  comments: Comment[];
  metadata: {
    lastId: number;
    totalCount: number;
    lastUpdated: string;
  };
}

// 모든 댓글 로드
export async function loadComments(): Promise<Comment[]>

// 댓글 저장
export async function saveComments(comments: Comment[]): Promise<void>

// 댓글 추가
export async function addComment(comment: Omit<Comment, 'id'>): Promise<Comment>

// 게시글별 댓글 조회
export async function getCommentsByPostId(postId: number): Promise<Comment[]>

// 댓글 삭제
export async function deleteComment(id: number): Promise<boolean>

// 초기 데이터 생성
export async function initializeCommentsData(): Promise<void>
```

### Phase 2: 기존 코드 리팩토링

#### 2.1 `lib/posts.ts` 수정
```typescript
// Before: 메모리 배열
let posts: Post[] = generateSamplePosts();

// After: 파일 기반
import { loadPosts, savePosts, addPost as addPostToFile } from './storage/postStorage';

export async function getPosts(): Promise<Post[]> {
  const posts = await loadPosts();
  return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function createPost(data: Omit<Post, "id" | "createdAt" | "views">): Promise<Post> {
  const newPost = await addPostToFile({
    ...data,
    createdAt: new Date(),
    views: 0,
  });
  return newPost;
}
```

#### 2.2 `lib/comments.ts` 수정
```typescript
// Before: 메모리 배열
let comments: Comment[] = [...];

// After: 파일 기반
import { loadComments, addComment as addCommentToFile } from './storage/commentStorage';

export async function getCommentsByPostId(postId: number): Promise<Comment[]> {
  const comments = await loadComments();
  return comments
    .filter(c => c.postId === postId)
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
}
```

### Phase 3: API 라우트 수정

#### 3.1 `app/api/posts/route.ts`
```typescript
// Before: 동기 함수
export async function POST(request: Request) {
  const newPost = createPost({ title, content, author });
  return NextResponse.json(newPost);
}

// After: 비동기 처리
export async function POST(request: Request) {
  const newPost = await createPost({ title, content, author });
  return NextResponse.json(newPost);
}
```

#### 3.2 `app/api/comments/route.ts`
```typescript
export async function POST(request: Request) {
  const newComment = await createComment({ postId, content, author });
  return NextResponse.json(newComment);
}
```

### Phase 4: 페이지 컴포넌트 수정

#### 4.1 `app/page.tsx` - 이미 async 함수
```typescript
// 변경 필요 없음 (이미 async)
export default async function Home({ searchParams }: HomeProps) {
  const { posts, ... } = await getPostsWithPagination(page, pageSize);
  // ...
}
```

#### 4.2 `app/posts/[id]/page.tsx`
```typescript
export default async function PostDetailPage({ params }: Props) {
  const post = await getPost(parseInt(id));
  const comments = await getCommentsByPostId(parseInt(id));
  // ...
}
```

### Phase 5: 초기 데이터 마이그레이션

#### 5.1 마이그레이션 스크립트 (`scripts/migrate-to-json.ts`)
```typescript
import { generateSamplePosts } from '../lib/posts';
import { initializePostsData, initializeCommentsData } from '../lib/storage';

async function migrate() {
  console.log('Starting migration...');

  // 1. 게시글 데이터 생성
  await initializePostsData();

  // 2. 댓글 데이터 생성
  await initializeCommentsData();

  console.log('Migration completed!');
}

migrate();
```

실행:
```bash
npx tsx scripts/migrate-to-json.ts
```

---

## API 설계

### 파일 시스템 기반 CRUD

#### 게시글 API

| 메소드 | 엔드포인트 | 동작 | 파일 작업 |
|--------|------------|------|-----------|
| GET | `/api/posts` | 전체 조회 | posts.json 읽기 |
| GET | `/api/posts/[id]` | 단일 조회 | posts.json 읽기 + 조회수 증가 |
| POST | `/api/posts` | 생성 | posts.json 읽기 → 추가 → 쓰기 |
| PUT | `/api/posts/[id]` | 수정 | posts.json 읽기 → 수정 → 쓰기 |
| DELETE | `/api/posts/[id]` | 삭제 | posts.json 읽기 → 삭제 → 쓰기 |

#### 댓글 API

| 메소드 | 엔드포인트 | 동작 | 파일 작업 |
|--------|------------|------|-----------|
| GET | `/api/comments?postId=1` | 게시글별 조회 | comments.json 읽기 + 필터링 |
| POST | `/api/comments` | 생성 | comments.json 읽기 → 추가 → 쓰기 |
| DELETE | `/api/comments/[id]` | 삭제 | comments.json 읽기 → 삭제 → 쓰기 |

### 동시성 제어 전략

#### 옵션 1: 단순 잠금 (권장)
```typescript
let isWriting = false;

async function writeWithLock<T>(filename: string, data: T) {
  while (isWriting) {
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  isWriting = true;
  try {
    await writeJsonFile(filename, data);
  } finally {
    isWriting = false;
  }
}
```

#### 옵션 2: Queue 기반 (고급)
```typescript
import PQueue from 'p-queue';

const writeQueue = new PQueue({ concurrency: 1 });

async function writeWithQueue<T>(filename: string, data: T) {
  return writeQueue.add(() => writeJsonFile(filename, data));
}
```

#### 옵션 3: 파일 잠금 (proper-lockfile)
```typescript
import lockfile from 'proper-lockfile';

async function writeWithFileLock<T>(filename: string, data: T) {
  const release = await lockfile.lock(filename);
  try {
    await writeJsonFile(filename, data);
  } finally {
    await release();
  }
}
```

---

## 주의사항

### 1. 성능 고려사항
- **문제**: 파일 전체를 읽고 쓰므로 데이터가 많으면 느려짐
- **해결책**:
  - 100개 이하: 문제없음
  - 1000개 이상: 데이터베이스 권장
  - 중간 규모: SQLite 고려

### 2. 동시 접근 문제
- **문제**: 여러 요청이 동시에 파일을 수정하면 데이터 손실
- **해결책**:
  - 개발 환경: 단순 잠금으로 충분
  - 프로덕션: 데이터베이스 필수

### 3. 에러 처리
```typescript
try {
  const data = await loadPosts();
} catch (error) {
  if (error.code === 'ENOENT') {
    // 파일 없음 → 초기화
    await initializePostsData();
  } else if (error.code === 'EACCES') {
    // 권한 오류
    console.error('Permission denied');
  } else {
    // 기타 오류
    console.error('Unknown error:', error);
  }
}
```

### 4. 데이터 검증
```typescript
import { z } from 'zod';

const PostSchema = z.object({
  id: z.number(),
  title: z.string().min(1),
  content: z.string(),
  author: z.string().min(1),
  createdAt: z.string().datetime(),
  views: z.number().min(0),
});

const PostsDataSchema = z.object({
  posts: z.array(PostSchema),
  metadata: z.object({
    lastId: z.number(),
    totalCount: z.number(),
    lastUpdated: z.string().datetime(),
  }),
});

// 파일 읽기 후 검증
const data = PostsDataSchema.parse(jsonData);
```

### 5. 백업 전략
```typescript
async function backupData() {
  const timestamp = new Date().toISOString().split('T')[0];
  await fs.copyFile(
    'data/posts.json',
    `data/backups/posts_${timestamp}.json`
  );
  await fs.copyFile(
    'data/comments.json',
    `data/backups/comments_${timestamp}.json`
  );
}

// 매일 자동 백업
setInterval(backupData, 24 * 60 * 60 * 1000);
```

### 6. .gitignore 설정
```gitignore
# 데이터 파일 제외 (민감 정보 포함 가능)
/data/*.json

# 백업 파일 제외
/data/backups/

# 샘플 데이터는 포함 (선택)
!/data/posts.sample.json
!/data/comments.sample.json
```

---

## 마이그레이션 계획

### Step 1: 준비 (브랜치 생성)
```bash
git checkout -b feature/json-file-storage
```

### Step 2: 파일 생성 순서
1. `data/` 디렉토리 생성
2. `lib/storage/fileStorage.ts` - 기본 유틸
3. `lib/storage/postStorage.ts` - 게시글 저장소
4. `lib/storage/commentStorage.ts` - 댓글 저장소
5. `types/storage.ts` - 새 타입 정의

### Step 3: 기존 코드 수정
1. `lib/posts.ts` - async/await 추가
2. `lib/comments.ts` - async/await 추가
3. API 라우트 수정 (이미 async)
4. 페이지 수정 (이미 async)

### Step 4: 테스트
1. 게시글 생성 → posts.json 확인
2. 댓글 작성 → comments.json 확인
3. 서버 재시작 → 데이터 유지 확인
4. 페이지네이션 동작 확인

### Step 5: 초기 데이터 생성
```bash
npx tsx scripts/migrate-to-json.ts
```

### Step 6: 커밋 및 PR
```bash
git add .
git commit -m "feat: Implement JSON file-based data storage"
git push origin feature/json-file-storage
gh pr create
```

---

## 예상 코드 라인 수

| 파일 | 라인 수 | 설명 |
|------|---------|------|
| `lib/storage/fileStorage.ts` | ~100 | 파일 I/O 유틸 |
| `lib/storage/postStorage.ts` | ~150 | 게시글 저장소 |
| `lib/storage/commentStorage.ts` | ~120 | 댓글 저장소 |
| `lib/posts.ts` (수정) | ~50 | async 변환 |
| `lib/comments.ts` (수정) | ~40 | async 변환 |
| `types/storage.ts` | ~30 | 타입 정의 |
| `scripts/migrate-to-json.ts` | ~80 | 마이그레이션 |
| **총계** | **~570** | |

---

## 타임라인

| 단계 | 예상 시간 | 작업 내용 |
|------|-----------|-----------|
| Phase 1 | 30분 | 파일 저장소 유틸리티 |
| Phase 2 | 20분 | 기존 코드 리팩토링 |
| Phase 3 | 10분 | API 라우트 수정 |
| Phase 4 | 5분 | 페이지 확인 |
| Phase 5 | 15분 | 초기 데이터 마이그레이션 |
| 테스트 | 20분 | 전체 기능 테스트 |
| **총계** | **100분** | **약 1.5시간** |

---

## 결론

### 채택 이유
✅ 데이터베이스 설정 불필요
✅ 데이터 영구 저장
✅ 간단한 구현
✅ 개발/학습 환경에 적합

### 제한사항
⚠️ 동시 접근 제한적
⚠️ 대용량 데이터 부적합
⚠️ 프로덕션 환경 권장 안 함

### 다음 단계 (향후)
1. SQLite로 마이그레이션
2. PostgreSQL/MySQL 연동
3. Prisma ORM 도입
4. Redis 캐싱 추가

---

**작성일**: 2025-01-12
**작성자**: Claude Code
**버전**: 1.0
